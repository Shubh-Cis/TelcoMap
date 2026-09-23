import React from 'react';
import { Globe, CheckCircle2, AlertTriangle, AlertOctagon, Cpu, ShieldCheck } from 'lucide-react';
import { NetworkSummary as SummaryType, OperationalStatus } from '../types/network';

interface NetworkSummaryProps {
  summary: SummaryType | null;
  selectedFilter: OperationalStatus | 'ALL';
  onSelectFilter: (status: OperationalStatus | 'ALL') => void;
}

export const NetworkSummary: React.FC<NetworkSummaryProps> = ({
  summary,
  selectedFilter,
  onSelectFilter,
}) => {
  const total = summary?.totalSites ?? 0;
  const healthy = summary?.healthySites ?? 0;
  const degraded = summary?.degradedSites ?? 0;
  const critical = summary?.criticalSites ?? 0;
  const totalDev = summary?.totalDevices ?? 0;
  const onlineDev = summary?.onlineDevices ?? 0;
  const availability = summary?.networkAvailabilityPercent ?? 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Sites */}
      <button
        onClick={() => onSelectFilter('ALL')}
        className={`text-left p-4 rounded-xl border transition-all ${
          selectedFilter === 'ALL'
            ? 'bg-sky-500/10 border-sky-500 shadow-md shadow-sky-500/10'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider">Total Sites</span>
          <Globe className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-bold text-white">{total}</div>
        <div className="text-[11px] text-slate-400 mt-1">Multi-technology POPs</div>
      </button>

      {/* Healthy Sites */}
      <button
        onClick={() => onSelectFilter('HEALTHY')}
        className={`text-left p-4 rounded-xl border transition-all ${
          selectedFilter === 'HEALTHY'
            ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-400 mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider">Healthy</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-300">{healthy}</div>
        <div className="text-[11px] text-emerald-400/80 mt-1">Operating normal</div>
      </button>

      {/* Degraded Sites */}
      <button
        onClick={() => onSelectFilter('DEGRADED')}
        className={`text-left p-4 rounded-xl border transition-all ${
          selectedFilter === 'DEGRADED'
            ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-amber-400 mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider">Degraded</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-300">{degraded}</div>
        <div className="text-[11px] text-amber-400/80 mt-1">Latency / Jitter high</div>
      </button>

      {/* Critical Sites */}
      <button
        onClick={() => onSelectFilter('CRITICAL')}
        className={`text-left p-4 rounded-xl border transition-all ${
          selectedFilter === 'CRITICAL'
            ? 'bg-rose-500/15 border-rose-500 shadow-md shadow-rose-500/10'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-rose-400 mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider">Critical</span>
          <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
        </div>
        <div className="text-2xl font-bold text-rose-300">{critical}</div>
        <div className="text-[11px] text-rose-400/80 mt-1">Major outage / link loss</div>
      </button>

      {/* Device Inventory */}
      <div className="p-4 rounded-xl border bg-slate-900/80 border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider">Devices</span>
          <Cpu className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {onlineDev} <span className="text-sm font-normal text-slate-400">/ {totalDev}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Routers &amp; Terminals</div>
      </div>

      {/* Network Availability */}
      <div className="p-4 rounded-xl border bg-slate-900/80 border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase font-semibold tracking-wider">SLA Index</span>
          <ShieldCheck className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-bold text-sky-300">{availability}%</div>
        <div className="text-[11px] text-slate-400 mt-1">Core Network Uptime</div>
      </div>
    </div>
  );
};
