import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Info,
  Truck,
  Wrench,
  Cpu,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Alarm, WorkOrder, Site } from '../types/network';
import { networkApi } from '../services/networkApi';

interface OssDashboardProps {
  sites: Site[];
  onSelectSite: (site: Site) => void;
  onNavigateToMap: () => void;
}

export function OssDashboard({ sites, onSelectSite, onNavigateToMap }: OssDashboardProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedOrderTab, setSelectedOrderTab] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<Record<string, boolean>>({});

  const loadOssData = async () => {
    try {
      setLoading(true);
      const [alarmsRes, workOrdersRes] = await Promise.all([
        networkApi.getAlarms().catch(() => null),
        networkApi.getWorkOrders().catch(() => null),
      ]);

      if (alarmsRes?.alarms) {
        setAlarms(alarmsRes.alarms);
      }
      if (workOrdersRes?.workOrders) {
        setWorkOrders(workOrdersRes.workOrders);
      }
    } catch (err) {
      console.error('Failed to load OSS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOssData();
  }, []);

  const handleAcknowledge = (alarmId: string) => {
    setAcknowledgedAlarms((prev) => ({
      ...prev,
      [alarmId]: true,
    }));
  };

  // Derive counts
  const criticalCount = alarms.filter((a) => a.severity === 'CRITICAL').length;
  const majorCount = alarms.filter((a) => a.severity === 'MAJOR').length;
  const minorCount = alarms.filter((a) => a.severity === 'MINOR').length;
  const warningCount = alarms.filter((a) => a.severity === 'WARNING').length;

  const filteredAlarms = alarms.filter((a) => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity === selectedSeverity;
  });

  const filteredOrders = workOrders.filter((o) => {
    if (selectedOrderTab === 'ALL') return true;
    return o.status === selectedOrderTab;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Carrier OSS Operations &amp; FCAPS Console
              </h1>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                ITU-T X.733 Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time Fault, Configuration, Accounting, Performance &amp; Security (FCAPS) management. Correlates optical and radio faults directly with automated 4x4 Rigging dispatch and hardware inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadOssData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              <span>Refresh OSS</span>
            </button>
            <button
              onClick={onNavigateToMap}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition-all"
            >
              <span>View On GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* OSS Key Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Critical Alarms */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              Critical Faults (P1)
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{criticalCount}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              <span>Immediate Field Roll Required</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Metric 2: Active Dispatched Crews */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Dispatched 4x4 Crews
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {workOrders.filter((w) => w.status === 'DISPATCHED' || w.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-0.5 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>En Route to Tower Sites</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Carrier MTTR */}
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              Mean Time to Restore (MTTR)
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">18.4 min</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Sub-second LEO auto-failover</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: CMDB Hardware Inventory */}
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Online CMDB Hardware
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {sites.reduce((acc, s) => acc + (s.devices?.length || 0), 0)} Devices
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>Across 5 Regional Hubs</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION 1: Active FCAPS Alarm Management Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Active FCAPS Alarm Console</h2>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono">
                {alarms.length} Total Registered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ITU-T X.733 Carrier Alarm State Table. Click a site to jump directly to its telemetry &amp; live hardware diagnostics.
            </p>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'ALL', label: 'All Alarms', count: alarms.length },
              { id: 'CRITICAL', label: 'Critical', count: criticalCount, color: 'text-rose-400' },
              { id: 'MAJOR', label: 'Major', count: majorCount, color: 'text-amber-400' },
              { id: 'MINOR', label: 'Minor', count: minorCount, color: 'text-sky-400' },
              { id: 'WARNING', label: 'Warning', count: warningCount, color: 'text-slate-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSeverity(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedSeverity === tab.id
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded bg-slate-900 ${tab.color || 'text-slate-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alarms Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-950/40">
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Alarm Code</th>
                <th className="py-3 px-3">Network Site / Location</th>
                <th className="py-3 px-3">Source Interface / Port</th>
                <th className="py-3 px-3">Fault Description</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No active alarms matching selected severity filter.
                  </td>
                </tr>
              ) : (
                filteredAlarms.map((alarm) => {
                  const matchingSite = sites.find((s) => s.id === alarm.siteId || s.siteCode === alarm.site?.siteCode);
                  const isAcked = acknowledgedAlarms[alarm.id];

                  return (
                    <tr
                      key={alarm.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => matchingSite && onSelectSite(matchingSite)}
                    >
                      {/* Severity Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold border ${
                            alarm.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : alarm.severity === 'MAJOR'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : alarm.severity === 'MINOR'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {alarm.severity === 'CRITICAL' && <AlertOctagon className="w-3 h-3" />}
                          {alarm.severity === 'MAJOR' && <AlertTriangle className="w-3 h-3" />}
                          {alarm.severity === 'MINOR' && <Info className="w-3 h-3" />}
                          <span>{alarm.severity}</span>
                        </span>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                        {alarm.alarmCode}
                      </td>

                      {/* Site */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-sky-400 group-hover:underline flex items-center gap-1.5">
                          <span>{alarm.site?.siteCode || matchingSite?.siteCode}</span>
                          <span className="text-slate-400 font-normal">({alarm.site?.city || matchingSite?.city})</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{alarm.site?.siteName || matchingSite?.siteName}</div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                        {alarm.source}
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-medium text-slate-200 truncate">{alarm.title}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{alarm.description}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isAcked
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : alarm.status === 'ACTIVE'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {isAcked ? 'ACKNOWLEDGED' : alarm.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleAcknowledge(alarm.id)}
                          disabled={isAcked}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                            isAcked
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300'
                          }`}
                        >
                          {isAcked ? 'Acked' : 'Ack Alarm'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: 4x4 Rigging Field Force Dispatcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">4x4 Field Force &amp; Rigging Work Orders</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                TM Forum eTOM Workforce
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated truck roll dispatch for physical cable cuts, antenna re-alignments, and tower maintenance.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['ALL', 'DISPATCHED', 'STAGED', 'RESOLVED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedOrderTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedOrderTab === tab ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Work Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const matchingSite = sites.find((s) => s.id === order.siteId || s.siteCode === order.site?.siteCode);

            return (
              <div
                key={order.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-sky-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-400">{order.orderId}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        order.priority.includes('CRITICAL')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>
                      {order.site?.siteCode || matchingSite?.siteCode} - {order.site?.city || matchingSite?.city}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-amber-400" />
                        <span>Assigned Unit:</span>
                      </span>
                      <span className="text-slate-200 font-medium text-right line-clamp-1">{order.assignedCrew}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Vehicle:</span>
                      <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px]">{order.vehicle}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>ETA to Site:</span>
                      <span className="text-amber-400 font-bold font-mono">{order.estimatedArrival}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Truck Roll Cost:</span>
                      <span className="text-slate-200 font-mono font-semibold">${order.truckRollCostUsd} USD</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500 font-medium">Spares Loaded: </span>
                    <span className="text-slate-300">{order.requiredSpares}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      order.status === 'DISPATCHED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    STATUS: {order.status}
                  </span>
                  {matchingSite && (
                    <button
                      onClick={() => onSelectSite(matchingSite)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      <span>Inspect Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: CMDB Network Device Hardware Inventory */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Network Hardware Inventory (CMDB)</h2>
              <p className="text-xs text-slate-400">
                Granular hardware asset configuration, vendors, firmware models, and interface telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-950/40">
                <th className="py-3 px-3">Device Code</th>
                <th className="py-3 px-3">Device Name</th>
                <th className="py-3 px-3">Location Hub</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Hardware Model</th>
                <th className="py-3 px-3">Management IP</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sites.flatMap((site) =>
                (site.devices || []).map((device) => (
                  <tr key={device.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">{device.deviceCode}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{device.name}</td>
                    <td className="py-2.5 px-3 text-sky-400 font-medium">
                      {site.siteCode} ({site.city})
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{device.type}</td>
                    <td className="py-2.5 px-3 text-slate-200">{device.vendor}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px]">{device.model}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-300">{device.ipAddress}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                          device.status === 'ONLINE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
