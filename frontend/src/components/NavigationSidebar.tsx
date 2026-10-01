import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Activity,
  DollarSign,
  Globe,
  GitFork,
  Sparkles,
  Zap,
  Server,
  PlayCircle,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SystemHealth } from '../types/network';

export type ViewTab = 'overview' | 'map' | 'oss' | 'bss' | 'radar' | 'topology' | 'aiops' | 'chaos';

interface NavigationSidebarProps {
  activeView: ViewTab;
  onViewChange: (view: ViewTab) => void;
  health: SystemHealth | null;
  activeAlarmsCount?: number;
  totalMrrUsd?: number;
  onOpenWeeklyReport: () => void;
  onStartTour: () => void;
}

export function NavigationSidebar({
  activeView,
  onViewChange,
  health,
  activeAlarmsCount = 2,
  totalMrrUsd = 150500,
  onOpenWeeklyReport,
  onStartTour,
}: NavigationSidebarProps) {
  const navItems: Array<{
    id: ViewTab;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Executive Cockpit',
      sublabel: 'Panoramic Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      label: 'GIS Network Map',
      sublabel: 'Interactive Geospatial NOC',
      icon: MapIcon,
    },
    {
      id: 'oss',
      label: 'OSS Suite',
      sublabel: 'FCAPS Alarms & 4x4 Rigging',
      icon: Activity,
      badge: activeAlarmsCount > 0 ? `${activeAlarmsCount} Active` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'bss',
      label: 'BSS Governance',
      sublabel: 'SLA Contracts & MRR',
      icon: DollarSign,
      badge: `$${(totalMrrUsd / 1000).toFixed(0)}k MRR`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'radar',
      label: 'Cloudflare Radar',
      sublabel: 'Macro Telemetry & Outages',
      icon: Globe,
    },
    {
      id: 'topology',
      label: 'Network Topology',
      sublabel: 'Multi-Tier Graph Hierarchy',
      icon: GitFork,
    },
    {
      id: 'aiops',
      label: 'AIOps Copilot',
      sublabel: 'Root Cause & SLA Reports',
      icon: Sparkles,
      badge: 'AI Powered',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      id: 'chaos',
      label: 'Disaster Simulator',
      sublabel: 'Sub-Sec LEO Failover Drill',
      icon: Zap,
      badge: 'Live Drill',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md shadow-2xl lg:sticky lg:top-20 z-30">
      <div className="space-y-4">
        {/* Sidebar Header Brand */}
        <div className="px-2 pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Server className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider uppercase text-slate-200">Carrier Console</div>
              <div className="text-[10px] text-sky-400 font-mono">TM Forum ODA / eTOM</div>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
            v2.4
          </span>
        </div>

        {/* Feature Navigation List */}
        <nav className="space-y-1.5" aria-label="Carrier Operations Views">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full group text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between relative ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/40 text-white shadow-md shadow-sky-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-400 rounded-r-full shadow-lg shadow-sky-400" />
                )}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-sky-300 font-bold' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.sublabel}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-sky-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls & Status */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
        {/* Quick Pitch Tour & Executive Report Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onStartTour}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 hover:text-white text-[11px] font-semibold transition-all"
            title="Start Guided Client Pitch Tour"
          >
            <PlayCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Pitch Tour</span>
          </button>
          <button
            onClick={onOpenWeeklyReport}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-[11px] font-semibold transition-all"
            title="Generate Weekly Executive SLA Report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>SLA Report</span>
          </button>
        </div>

        {/* Live Database & Regulatory Status */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.database === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-slate-300 font-medium">PostgreSQL / Neon</span>
            </span>
            <span className="font-mono text-emerald-400 uppercase text-[9px]">
              {health?.database === 'connected' ? 'Online' : 'Retrying'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/40">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span>ZICTA Regulatory Compliance</span>
            </span>
            <span className="text-sky-400 font-mono text-[9px]">Audited</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
