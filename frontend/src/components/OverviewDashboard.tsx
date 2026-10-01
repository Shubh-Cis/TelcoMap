import React from 'react';
import {
  LayoutDashboard,
  Server,
  Activity,
  DollarSign,
  Globe,
  Zap,
  PlayCircle,
  FileSpreadsheet,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
  MapPin,
} from 'lucide-react';
import { Site, NetworkSummary, SystemHealth } from '../types/network';
import { RadarWidget } from './RadarWidget';

interface OverviewDashboardProps {
  summary: NetworkSummary | null;
  health: SystemHealth | null;
  sites: Site[];
  onSelectSite: (site: Site) => void;
  onNavigate: (view: 'map' | 'oss' | 'bss' | 'radar' | 'topology' | 'aiops' | 'chaos') => void;
  onStartTour: () => void;
  onOpenWeeklyReport: () => void;
}

export function OverviewDashboard({
  summary,
  health,
  sites,
  onSelectSite,
  onNavigate,
  onStartTour,
  onOpenWeeklyReport,
}: OverviewDashboardProps) {
  const degradedOrCriticalSites = sites.filter((s) => s.status !== 'HEALTHY');

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-sky-600/10 via-indigo-600/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                LIVE CARRIER NETWORK
              </span>
              <span className="text-slate-500 text-xs">&bull;</span>
              <span className="text-xs text-slate-400 font-mono">Zambia National Transit &amp; Edge</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Telecom Operations &amp; Intelligence Cockpit
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Unified Carrier OSS/BSS operations platform for <strong className="text-white">Intellilink Media &amp; CIS Engineering</strong>. Real-time telemetry across multi-technology backbone (5G, 4G, DWDM Fibre, Microwave, and Starlink LEO Satellite).
            </p>
          </div>

          {/* High-Impact Presentation Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartTour}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>1-Click Pitch Tour</span>
            </button>

            <button
              onClick={() => onNavigate('chaos')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Test Failover Drill</span>
            </button>

            <button
              onClick={onOpenWeeklyReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <span>Weekly SLA Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Network Availability */}
        <div
          onClick={() => onNavigate('map')}
          className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 rounded-xl p-4 shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-400">Availability</span>
            <Server className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono group-hover:text-sky-300 transition-colors">
            {summary?.networkAvailabilityPercent || 90}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{summary?.healthySites || 4} of {summary?.totalSites || 5} Sites Healthy</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* KPI 2: Active Alarms (OSS) */}
        <div
          onClick={() => onNavigate('oss')}
          className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-rose-400">Active OSS Alarms</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono group-hover:text-rose-300 transition-colors">
            {degradedOrCriticalSites.length} Sites Affected
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-rose-400/90 font-medium">1 P1 Critical Optical Break</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-rose-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* KPI 3: Contracted MRR (BSS) */}
        <div
          onClick={() => onNavigate('bss')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-emerald-400">Enterprise MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono group-hover:text-emerald-300 transition-colors">
            $150,500 <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-emerald-400/90 font-medium">5 Anchor Corporate SLA</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* KPI 4: ZICTA Sovereign Compliance */}
        <div
          onClick={() => onNavigate('bss')}
          className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-indigo-400">Regulatory Audit</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">100% AUDITED</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-indigo-400/90 font-medium">NLIC Intercept Probe Active</span>
            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left Site Status List + Right Macro Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Regional Sites & Active Alarm Hotspots */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <h2 className="text-base font-bold text-white">Regional Network Hubs (Zambia)</h2>
              </div>
              <button
                onClick={() => onNavigate('map')}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>View Full Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sites Quick List */}
            <div className="space-y-3">
              {sites.map((site) => {
                const isHealthy = site.status === 'HEALTHY';
                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      onSelectSite(site);
                      onNavigate('map');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isHealthy
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        : 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isHealthy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        }`}
                      >
                        {isHealthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{site.siteCode}</span>
                          <span className="text-xs text-slate-400">({site.city})</span>
                        </div>
                        <div className="text-xs text-slate-300 truncate">{site.siteName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Primary: {site.primaryTech} &bull; Backup: {site.backupTech || 'None'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isHealthy
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        }`}
                      >
                        {site.status}
                      </span>
                      <div className="text-[10px] text-sky-400 mt-1.5 flex items-center justify-end gap-1 font-medium">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Cloudflare Telemetry Radar */}
        <div className="lg:col-span-5 space-y-4">
          <RadarWidget />
        </div>
      </div>
    </div>
  );
}
