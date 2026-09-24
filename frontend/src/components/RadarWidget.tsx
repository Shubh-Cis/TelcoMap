import React, { useState, useEffect } from 'react';
import { networkApi } from '../services/networkApi';
import { RadarTelemetrySummary } from '../types/network';
import {
  Radio,
  Activity,
  Globe,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function RadarWidget() {
  const [data, setData] = useState<RadarTelemetrySummary | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '1d'>('7d');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const fetchRadarData = async (refresh = false, range = timeRange) => {
    try {
      setLoading(true);
      setError(null);
      const res = await networkApi.getRadarSummary('ZM', range, refresh);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load Cloudflare Radar data:', err);
      setError(err?.message || 'Failed to fetch regional telemetry');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (newRange: '7d' | '1d') => {
    setTimeRange(newRange);
    fetchRadarData(false, newRange);
  };

  useEffect(() => {
    fetchRadarData(false, timeRange);
  }, []);

  const getCauseBadge = (cause: string) => {
    switch (cause) {
      case 'CABLE_CUT':
        return {
          label: 'Fibre / Cable Cut',
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
        };
      case 'POWER_OUTAGE':
        return {
          label: 'Grid Power Failure',
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        };
      case 'CYBERATTACK':
        return {
          label: 'Cyberattack / DDoS',
          bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        };
      case 'GOVERNMENT_DIRECTED':
        return {
          label: 'Regulatory / Govt',
          bg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
        };
      default:
        return {
          label: 'Backbone Problem',
          bg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
        };
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-lg transition-all duration-300">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100 tracking-tight">
                Regional Internet &amp; ISP Radar
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/50">
                Cloudflare Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              National Internet Quality Index &amp; Backbone Outages &bull; Zambia (ZM)
            </p>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center gap-3">
          {data && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                data.status === 'OPERATIONAL'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : data.status === 'DEGRADED'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {data.status === 'OPERATIONAL' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Transit Operational (0 Cuts in ZM)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{data.statusMessage}</span>
                </>
              )}
            </div>
          )}

          {/* Time Range Toggle */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => handleRangeChange('1d')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                timeRange === '1d'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View 24-Hour Active Telemetry"
            >
              24H
            </button>
            <button
              onClick={() => handleRangeChange('7d')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                timeRange === '7d'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View 7-Day Baseline Telemetry"
            >
              7D
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchRadarData(true)}
            disabled={loading}
            title="Refresh Cloudflare Radar Telemetry"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isExpanded ? 'Collapse Radar Panel' : 'Expand Radar Panel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Cards Row */}
          {data ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: National Bandwidth */}
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Download Bandwidth (Median)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    IQI {timeRange.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-100">
                    {data.bandwidth.p50}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{data.bandwidth.unit}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>p25: {data.bandwidth.p25} Mbps</span>
                  <span>p75: {data.bandwidth.p75} Mbps</span>
                </div>
              </div>

              {/* Card 2: Transit Latency */}
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    Network Latency (RTT)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {data.latency.p50 < 150 ? 'Optimal' : 'Elevated'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-100">
                    {data.latency.p50}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{data.latency.unit}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>p25: {data.latency.p25} ms</span>
                  <span>p75: {data.latency.p75} ms</span>
                </div>
              </div>

              {/* Card 3: DNS Lookup Speed */}
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    DNS Resolution Time
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Fast
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-100">
                    {data.dns.p50}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{data.dns.unit}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>p25: {data.dns.p25} ms</span>
                  <span>p75: {data.dns.p75} ms</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex space-x-4 p-4 bg-slate-850/40 rounded-xl">
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
                <div className="h-8 bg-slate-700/30 rounded w-1/2"></div>
              </div>
            </div>
          )}

          {/* Disruption Feed Sub-Panel */}
          {data && data.recentDisruptions && data.recentDisruptions.length > 0 && (
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Recent Subsea Cable &amp; Backbone Incidents (Cloudflare Radar Feed)
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {data.recentDisruptions.length} incidents recorded
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {data.recentDisruptions.map((disruption) => {
                  const badge = getCauseBadge(disruption.outageCause);
                  const formattedDate = new Date(disruption.startDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={disruption.id}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formattedDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                          {disruption.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                        <span>
                          Impacted: {disruption.locations?.join(', ') || 'Regional Backbone'}
                        </span>
                        {disruption.linkedUrl && (
                          <a
                            href={disruption.linkedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                          >
                            Source <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Source: {data?.source || 'Cloudflare Radar'} &bull; {data?.cached ? 'Memory Cache (<5ms)' : 'Live Edge Sync'}
            </span>
            <span title="Cloudflare nationwide IQI calculation timestamp">
              Cloudflare Batch Sync: {data ? new Date(data.lastUpdated).toLocaleTimeString() : 'Syncing...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
