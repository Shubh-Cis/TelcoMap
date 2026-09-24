import React, { useState } from 'react';
import { X, Truck, CheckCircle2, Clock, Wrench, DollarSign, ShieldAlert, Copy, Check, Send } from 'lucide-react';
import { OssWorkOrder } from '../types/network';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: OssWorkOrder | null;
}

export function WorkOrderModal({ isOpen, onClose, workOrder }: WorkOrderModalProps) {
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !workOrder) return null;

  const handleAuthorize = () => {
    setIsDispatched(true);
  };

  const handleCopyManifest = () => {
    const text = `=== OSS FIELD DISPATCH MANIFEST ===
Work Order: ${workOrder.orderId}
Target Site: ${workOrder.siteCode} - ${workOrder.siteName}
Priority: ${workOrder.priority}
Status: ${isDispatched ? 'DISPATCHED & EN ROUTE' : 'PENDING AUTHORIZATION'}
Assigned Unit: ${workOrder.assignedCrew}
Vehicle: ${workOrder.vehicle}
ETA to Site: ${workOrder.estimatedArrival}
Estimated Truck-Roll Cost: $${workOrder.truckRollCostUsd} USD

REQUIRED SPARES & TOOLS:
${workOrder.requiredSpares.map((s, i) => `${i + 1}. [x] ${s}`).join('\n')}

Issued by: TelcoMap Carrier OSS Engine
====================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityColor =
    workOrder.priority.includes('CRITICAL')
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : workOrder.priority.includes('HIGH')
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-sky-500/20 text-sky-300 border-sky-500/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">OSS Field Work-Order Dispatch</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                  {workOrder.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Carrier Maintenance &amp; Automated Truck-Roll Orchestrator &bull; {workOrder.orderId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Dispatch Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            isDispatched
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isDispatched ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <Clock className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="font-bold block">
                {isDispatched ? 'DISPATCHED & EN ROUTE' : 'Awaiting NOC Dispatch Authorization'}
              </span>
              <span className="text-[11px] opacity-80">
                {isDispatched
                  ? `Crew rolling. Estimated on-site arrival in ${workOrder.estimatedArrival}.`
                  : 'All spare hardware staged and technician vehicle assigned.'}
              </span>
            </div>
          </div>

          <span className="font-mono text-[11px] opacity-70">
            {isDispatched ? 'OSS Status: 200 OK' : 'OSS Status: Staged'}
          </span>
        </div>

        {/* Operational Overview Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Target Site &amp; Location</span>
            <span className="font-bold text-slate-200 block text-sm">
              {workOrder.siteCode} &bull; {workOrder.siteName}
            </span>
            <span className="text-[11px] text-sky-400 font-mono">Zambia Domestic Corridor</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Assigned Field Crew</span>
            <span className="font-bold text-slate-200 block text-xs">{workOrder.assignedCrew}</span>
            <span className="text-[11px] text-slate-400 font-mono">{workOrder.vehicle}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Estimated Arrival (ETA)</span>
            <div className="flex items-center gap-1.5 text-slate-200 font-bold text-sm">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{workOrder.estimatedArrival}</span>
            </div>
            <span className="text-[10px] text-slate-500">Based on live road conditions</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Truck-Roll Cost (Est.)</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <DollarSign className="w-4 h-4" />
              <span>${workOrder.truckRollCostUsd} USD</span>
            </div>
            <span className="text-[10px] text-slate-500">Vehicle fuel + 2x Certified Riggers</span>
          </div>
        </div>

        {/* Spare Parts Bill of Materials (BOM) */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Required Spares &amp; Rigging Checklist (BOM)
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Staged in Van</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {workOrder.requiredSpares.map((spare, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{spare}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleCopyManifest}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Manifest' : 'Copy Manifest'}</span>
          </button>

          {!isDispatched ? (
            <button
              onClick={handleAuthorize}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Authorize &amp; Dispatch Crew</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Field Dispatch Authorized!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
