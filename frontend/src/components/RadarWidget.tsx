import React, { useState, useEffect, useRef } from 'react';
import { networkApi } from '../services/networkApi';
import { RadarTelemetrySummary } from '../types/network';
import {
  Radio,
  Activity,
  Globe,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Play,
  Pause,
} from 'lucide-react';

export function RadarWidget() {
  const [data, setData] = useState<RadarTelemetrySummary | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '1d'>('7d');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh interval (in seconds): 15s default, 30s, 60s, or 0 (paused)
  const [syncInterval, setSyncInterval] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const fetchRadarData = async (refresh = false, range = timeRange) => {
    try {
      setLoading(true);
      setError(null);
      const res = await networkApi.getRadarSummary('ZM', range, refresh);
      setData(res);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Failed to load Cloudflare Radar data:', err);
      setError(err?.message || 'Failed to fetch regional telemetry');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRadarData(false, timeRange);
  }, []);

  // Interval timer for live auto-sync
  useEffect(() => {
    if (syncInterval === 0) return; // Paused

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger live fetch bypassing cache
          fetchRadarData(true, timeRange);
          return syncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncInterval, timeRange]);

  const handleRangeChange = (newRange: '7d' | '1d') => {
    setTimeRange(newRange);
    setCountdown(syncInterval);
    fetchRadarData(false, newRange);
  };

  const handleManualRefresh = () => {
    setCountdown(syncInterval);
    fetchRadarData(true, timeRange);
  };

  const handleIntervalChange = (newInterval: number) => {
    setSyncInterval(newInterval);
    setCountdown(newInterval);
  };

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
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/95 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm text-slate-100 tracking-tight">
                  Regional ISP Radar
                </h3>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60">
                  Cloudflare Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zambia (ZM) National Telemetry</p>
            </div>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            title="Force refresh live Cloudflare Radar telemetry"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 border border-slate-700/60 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>

        {/* Status Pill & Time Range */}
        <div className="flex items-center justify-between gap-2">
          {data && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                data.status === 'OPERATIONAL'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : data.status === 'DEGRADED'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate max-w-[160px]">
                {data.status === 'OPERATIONAL' ? 'Transit Operational' : data.statusMessage}
              </span>
            </div>
          )}

          {/* Time Range Toggle (24H vs 7D) */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs shrink-0">
            <button
              onClick={() => handleRangeChange('1d')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                timeRange === '1d'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="24-Hour Active Telemetry"
            >
              24H
            </button>
            <button
              onClick={() => handleRangeChange('7d')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                timeRange === '7d'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="7-Day Baseline Telemetry"
            >
              7D
            </button>
          </div>
        </div>

        {/* Live Auto-Refresh Controller Bar */}
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-sky-400" />
            <span className="text-slate-400 font-medium">Auto-Sync:</span>
            {syncInterval > 0 ? (
              <span className="font-mono text-sky-300 font-semibold">
                {loading ? 'Fetching...' : `${countdown}s`}
              </span>
            ) : (
              <span className="text-slate-500 font-mono">Paused</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {[15, 30, 60].map((interval) => (
              <button
                key={interval}
                onClick={() => handleIntervalChange(interval)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  syncInterval === interval
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={`Set auto-refresh to ${interval} seconds`}
              >
                {interval}s
              </button>
            ))}
            <button
              onClick={() => handleIntervalChange(syncInterval === 0 ? 15 : 0)}
              className={`p-1 rounded text-[10px] transition-colors ${
                syncInterval === 0
                  ? 'text-amber-400 bg-amber-950/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={syncInterval === 0 ? 'Resume Auto-Sync' : 'Pause Auto-Sync'}
            >
              {syncInterval === 0 ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Widget Body */}
      <div className="p-4 space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto">
        {error && (
          <div className="p-2.5 text-xs bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="text-[11px]">{error}</span>
          </div>
        )}

        {/* Metric Cards Stack */}
        {data ? (
          <div className="space-y-2.5">
            {/* Metric 1: Download Bandwidth */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  National Bandwidth (Median)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {timeRange.toUpperCase()}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {data.bandwidth.p50}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{data.bandwidth.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  p25: {data.bandwidth.p25} &bull; p75: {data.bandwidth.p75}
                </div>
              </div>
            </div>

            {/* Metric 2: Network Latency */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Transit Latency (RTT)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  {data.latency.p50 < 150 ? 'Optimal' : 'Elevated'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {data.latency.p50}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{data.latency.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  p25: {data.latency.p25} &bull; p75: {data.latency.p75}
                </div>
              </div>
            </div>

            {/* Metric 3: DNS Resolution Time */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  DNS Resolution Time
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Fast
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {data.dns.p50}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{data.dns.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  p25: {data.dns.p25} &bull; p75: {data.dns.p75}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse space-y-2 p-3 bg-slate-950/40 rounded-lg">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-7 bg-slate-800 rounded w-3/4"></div>
          </div>
        )}

        {/* Disruption Feed Sub-Panel */}
        {data && data.recentDisruptions && data.recentDisruptions.length > 0 && (
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Backbone Incidents
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {data.recentDisruptions.length} events
              </span>
            </div>

            <div className="space-y-2">
              {data.recentDisruptions.slice(0, 3).map((disruption) => {
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
                    className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{formattedDate}</span>
                    </div>
                    <p className="text-slate-300 leading-snug line-clamp-2 text-[10px]">
                      {disruption.description}
                    </p>
                    {disruption.linkedUrl && (
                      <div className="pt-0.5 text-right">
                        <a
                          href={disruption.linkedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 text-[9px] inline-flex items-center gap-0.5"
                        >
                          Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Metadata */}
        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Live Edge Sync
            </span>
            <span>Cloudflare Radar</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 font-mono">
            <span>Last Sync:</span>
            <span>{lastSyncTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
