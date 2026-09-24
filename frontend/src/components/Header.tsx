import React from 'react';
import { Activity, Database, RefreshCw, Radio, Layers, MapPin, Plus, Sparkles, FileText } from 'lucide-react';
import { SystemHealth } from '../types/network';

interface HeaderProps {
  health: SystemHealth | null;
  loading: boolean;
  onRefresh: () => void;
  activeView: 'map' | 'topology' | 'table';
  onViewChange: (view: 'map' | 'topology' | 'table') => void;
  onOpenAddSite: () => void;
  onOpenWeeklyReport: () => void;
  onToggleGuidedTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  loading,
  onRefresh,
  activeView,
  onViewChange,
  onOpenAddSite,
  onOpenWeeklyReport,
  onToggleGuidedTour,
}) => {
  const isHealthy = health?.status === 'ok' && health?.database === 'connected';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Platform Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Telecom Network Operations &amp; Intelligence Platform
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  NOC v1.0
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-400">
                Multi-Access Infrastructure (4G / 5G / Fibre / Microwave / Satellite)
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border border-sky-500/30 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300">Architecture:</span>
                <strong className="text-sky-300 font-semibold tracking-wide">Intellilink Media</strong>
                <span className="text-slate-500">&times;</span>
                <span className="text-slate-300">Engineering:</span>
                <strong className="text-indigo-300 font-semibold tracking-wide">CIS Delivery</strong>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher & Health Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === 'map'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              NOC Map
            </button>
            <button
              onClick={() => onViewChange('topology')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === 'topology'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Topology
            </button>
            <button
              onClick={() => onViewChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === 'table'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Inventory
            </button>
          </div>

          {/* Backend & DB Health Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              isHealthy
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
            title={`Backend: ${health?.status || 'connecting'}, DB: ${health?.database || 'connecting'}, Uptime: ${health?.uptimeSeconds || 0}s`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="hidden sm:inline">Backend API:</span>
            <span>{health ? 'ONLINE' : 'CONNECTING'}</span>
            <span className="text-slate-600">|</span>
            <Database className="w-3 h-3 text-slate-400" />
            <span>{health?.database === 'connected' ? 'PostgreSQL OK' : 'DB Sync'}</span>
          </div>

          {/* Weekly Operations AI Report Action */}
          <button
            onClick={onOpenWeeklyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer border border-indigo-400/30"
            title="Generate AI-driven weekly operations & site focus report"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Weekly AI Report</span>
          </button>

          {/* Guided Executive Pitch Tour Action */}
          <button
            onClick={onToggleGuidedTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer border border-amber-300/40"
            title="Start Guided Executive Pitch & Demo Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Pitch Tour</span>
          </button>

          {/* Add Site Action */}
          <button
            onClick={onOpenAddSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            title="Provision a new network site to the NOC"
          >
            <Plus className="w-4 h-4" />
            <span>Add Site</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh network telemetry & status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
