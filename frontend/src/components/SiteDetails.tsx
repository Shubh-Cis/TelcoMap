import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Radio,
  Wifi,
  Server,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Building2,
  DollarSign,
  Truck,
  ArrowRightLeft,
  Lock,
} from 'lucide-react';
import { Site, ConnectivityTechnology, AiDiagnosisResult } from '../types/network';
import { networkApi } from '../services/networkApi';
import { WorkOrderModal } from './WorkOrderModal';
import { getSiteBssProfile, generateOssWorkOrder } from '../utils/bssOssData';

interface SiteDetailsProps {
  site: Site | null;
  onClose: () => void;
}

const getTechBadge = (tech: ConnectivityTechnology) => {
  const map: Record<ConnectivityTechnology, { label: string; color: string }> = {
    FIVE_G: { label: '5G Core Gateway', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    FOUR_G: { label: '4G LTE Access', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    FIBRE: { label: 'Fibre Optic Backhaul', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    MICROWAVE: { label: 'Microwave Radio Link', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    SATELLITE: { label: 'Satellite VSAT Backhaul', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    HYBRID: { label: 'Hybrid Multi-Link', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  };

  return map[tech] || { label: tech, color: 'bg-slate-700 text-slate-300 border-slate-600' };
};

export const SiteDetails: React.FC<SiteDetailsProps> = ({ site, onClose }) => {
  const [diagnosis, setDiagnosis] = useState<AiDiagnosisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState<boolean>(false);
  const [isFailoverActive, setIsFailoverActive] = useState<boolean>(false);

  // Reset states when selected site changes
  useEffect(() => {
    setDiagnosis(null);
    setErrorAi(null);
    setIsFailoverActive(false);
    setIsWorkOrderOpen(false);
  }, [site?.id]);

  if (!site) return null;

  const isHealthy = site.status === 'HEALTHY';
  const isDegraded = site.status === 'DEGRADED';
  const isCritical = site.status === 'CRITICAL';

  const primaryBadge = getTechBadge(site.primaryTech);
  const backupBadge = site.backupTech ? getTechBadge(site.backupTech) : null;
  const bss = getSiteBssProfile(site, isFailoverActive);

  const handleRunDiagnosis = async () => {
    try {
      setLoadingAi(true);
      setErrorAi(null);
      const res = await networkApi.diagnoseSite(site.siteCode);
      setDiagnosis(res);
    } catch (err: any) {
      console.error('Failed to run AI diagnosis:', err);
      setErrorAi(err?.message || 'Unable to complete AI diagnosis');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopyTicket = () => {
    if (!diagnosis?.incidentDraft) return;
    const draft = diagnosis.incidentDraft;
    const text = `=== TELECOM NOC INCIDENT DRAFT ===
Ticket ID: ${draft.incidentCode}
Title: ${draft.incidentTitle}
Severity: ${draft.severity}
Assigned Queue: ${draft.assignedTeam}
Site: ${diagnosis.siteCode} (${diagnosis.siteName})
Status: ${diagnosis.status}

PROBABLE ROOT CAUSE:
${diagnosis.probableRootCause}

SLA IMPACT:
${diagnosis.slaImpact}

DESCRIPTION:
${draft.description}

IMMEDIATE TRIAGE STEPS:
${draft.immediateActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Synthesized by: ${diagnosis.modelUsed}
==================================`;

    navigator.clipboard.writeText(text);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-5 animate-in fade-in duration-200">
      {/* Top Header with Site Code, Name, Location and Close */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
              {site.siteCode}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isHealthy
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  : isDegraded
                  ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
              }`}
            >
              {isHealthy && <CheckCircle2 className="w-3 h-3" />}
              {isDegraded && <AlertTriangle className="w-3 h-3" />}
              {isCritical && <AlertOctagon className="w-3 h-3 animate-pulse" />}
              {site.status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{site.siteName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              {site.city}, {site.region}, {site.country}
            </span>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-slate-400">
              GPS: {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2-Column Responsive Body for Full-Width Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT COLUMN: AI Copilot & Deployed Physical Hardware */}
        <div className="space-y-4">
          {/* AI Root-Cause Diagnostic Copilot Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Root-Cause Copilot</span>
              </div>

              <button
                onClick={handleRunDiagnosis}
                disabled={loadingAi}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  !diagnosis
                    ? isCritical
                      ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 animate-pulse'
                      : isDegraded
                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
                      : 'bg-sky-500 hover:bg-sky-400 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                } disabled:opacity-50`}
              >
                <RefreshCw className={`w-3 h-3 ${loadingAi ? 'animate-spin' : ''}`} />
                <span>{loadingAi ? 'Analyzing Link...' : diagnosis ? 'Re-Analyze' : '⚡ Run Diagnostic'}</span>
              </button>
            </div>

            {/* Error Notice */}
            {errorAi && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between">
                <span>{errorAi}</span>
                <button
                  onClick={handleRunDiagnosis}
                  className="text-[11px] underline font-bold hover:text-white ml-2 shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Diagnosis Results */}
            {diagnosis ? (
              <div className="pt-2 border-t border-slate-850 space-y-2 text-xs animate-in fade-in duration-150">
                {/* Root Cause */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Probable Engineering Root Cause
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {diagnosis.probableRootCause}
                  </p>
                </div>

                {/* SLA Impact */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    SLA &amp; Business Impact
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {diagnosis.slaImpact}
                  </p>
                </div>

                {/* Action Checklist */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Prescribed Field &amp; NOC Remediation
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {diagnosis.recommendedActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold shrink-0">{i + 1}.</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Actions: Copy Incident Draft & Dispatch OSS Work Order */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTicket}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                      title="Copy formatted incident report for ticketing system"
                    >
                      {copiedTicket ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Incident</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsWorkOrderOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-600/40 text-sky-300 text-[11px] font-semibold transition-colors"
                      title="Dispatch Carrier Field Work Order (OSS)"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch OSS Work Order</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {diagnosis.modelUsed.split(' ')[0]} ({diagnosis.confidenceScore}% conf.)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Click '⚡ Run Diagnostic' to evaluate RF link telemetry and root-cause analysis.
                </span>
                <button
                  onClick={() => setIsWorkOrderOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Prepare Work Order</span>
                </button>
              </div>
            )}
          </div>

          {/* Deployed Devices at Site */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Physical &amp; Logical Devices ({site.devices?.length || 0})
              </span>
              <span className="text-[11px] text-slate-500 font-normal">Active Hardware</span>
            </div>

            <div className="space-y-2">
              {site.devices?.map((dev) => (
                <div
                  key={dev.id}
                  className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span>{dev.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {dev.deviceCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {dev.vendor} {dev.model} &bull; <span className="font-mono text-slate-400">{dev.ipAddress}</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        dev.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : dev.status === 'DEGRADED'
                          ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                          : 'bg-rose-950 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {dev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Network Links & Failover, BSS Contract, Regulatory Status */}
        <div className="space-y-4">
          {/* Connectivity Technologies & Converged SDN Failover */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                Network Transport Links
              </div>
              {backupBadge && (
                <button
                  onClick={() => setIsFailoverActive(!isFailoverActive)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                    isFailoverActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Simulate primary transport disruption and automated satellite/microwave failover"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>{isFailoverActive ? '↺ Restore Primary Link' : '⚡ Simulate Link Cut'}</span>
                </button>
              )}
            </div>

            {isFailoverActive && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 animate-in fade-in duration-150">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>
                  <strong>SDN Dynamic Failover Active</strong>: Primary link severed. Live backhaul operating over {backupBadge?.label || 'Satellite'}.
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                  isFailoverActive ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 line-through' : primaryBadge.color
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>Primary: {primaryBadge.label} {isFailoverActive ? '(Cut ❌)' : ''}</span>
              </div>
              {backupBadge && (
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                    isFailoverActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-400' : backupBadge.color
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span>Backup: {backupBadge.label} {isFailoverActive ? '(Active 🟢)' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* BSS Enterprise SLA Contract Governance */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                BSS Enterprise SLA Contract
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {bss.contractTier}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-200">{bss.clientName}</div>
              <div className="text-xs text-slate-400">{bss.industry}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Monthly Contract Value</span>
                <span className="font-bold text-slate-200 font-mono text-sm">
                  ${bss.monthlyRevenueUsd.toLocaleString()} USD
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">SLA Target vs Actual</span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`font-bold font-mono text-sm ${
                      bss.currentSlaPercent >= bss.slaTargetPercent
                        ? 'text-emerald-400'
                        : bss.currentSlaPercent >= 98
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {bss.currentSlaPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500">/ {bss.slaTargetPercent}%</span>
                </div>
              </div>
            </div>

            {/* Penalty Exposure Row */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Contractual Penalty Risk:
              </span>
              <span
                className={`font-bold font-mono ${
                  bss.penaltyRiskUsd === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {bss.penaltyRiskUsd === 0 ? '$0 Compliant' : `-$${bss.penaltyRiskUsd.toLocaleString()} SLA Credit Exposure`}
              </span>
            </div>
          </div>

          {/* Regulatory Sovereignty & ZICTA Compliance */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Data Sovereignty &amp; Regulatory Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                ZICTA Compliant
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Egress Architecture:</span>
                <span className="font-medium text-slate-200">{bss.dataSovereignty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lawful Interception:</span>
                <span className="text-emerald-400 font-medium">{bss.lawfulInterceptionStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Spectrum License:</span>
                <span className="font-mono text-slate-400">{bss.zictaLicense}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OSS Work-Order Dispatch Modal */}
      <WorkOrderModal
        isOpen={isWorkOrderOpen}
        onClose={() => setIsWorkOrderOpen(false)}
        workOrder={generateOssWorkOrder(site)}
      />
    </div>
  );
};

