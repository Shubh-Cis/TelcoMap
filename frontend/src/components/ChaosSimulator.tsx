import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Site } from '../types/network';

interface ChaosSimulatorProps {
  sites: Site[];
  onSelectSite: (site: Site) => void;
  onNavigateToMap: () => void;
}

export function ChaosSimulator({ sites, onSelectSite, onNavigateToMap }: ChaosSimulatorProps) {
  const [drillActive, setDrillActive] = useState<boolean>(false);
  const [drillStep, setDrillStep] = useState<number>(0);
  const [drillLogs, setDrillLogs] = useState<
    Array<{ step: number; title: string; time: string; status: 'DONE' | 'IN_PROGRESS' | 'PENDING'; desc: string }>
  >([]);

  const livingstoneSite = sites.find((s) => s.siteCode === 'ZM-005') || sites[0];

  const startDrill = () => {
    setDrillActive(true);
    setDrillStep(1);
    setDrillLogs([
      {
        step: 1,
        title: 'Step 1: DWDM Optical Fibre Severed',
        time: 'T+00.00s',
        status: 'IN_PROGRESS',
        desc: 'Simulating physical backhoe fiber cut on Lusaka-Livingstone highway (T1 trunk). Optical signal loss detected on Port 1/0/1.',
      },
    ]);
  };

  const resetDrill = () => {
    setDrillActive(false);
    setDrillStep(0);
    setDrillLogs([]);
  };

  useEffect(() => {
    if (!drillActive) return;

    if (drillStep === 1) {
      const timer = setTimeout(() => {
        setDrillStep(2);
        setDrillLogs((prev) => [
          { ...prev[0], status: 'DONE' },
          {
            step: 2,
            title: 'Step 2: BGP Carrier Peer Session Drops',
            time: 'T+00.08s',
            status: 'IN_PROGRESS',
            desc: 'BGP Keepalive timeout triggered. Carrier upstream route withdrawn across national transit ring.',
          },
        ]);
      }, 1800);
      return () => clearTimeout(timer);
    }

    if (drillStep === 2) {
      const timer = setTimeout(() => {
        setDrillStep(3);
        setDrillLogs((prev) => [
          prev[0],
          { ...prev[1], status: 'DONE' },
          {
            step: 3,
            title: 'Step 3: Autonomous BGP Reroute to LEO Starlink NTN',
            time: 'T+00.14s',
            status: 'IN_PROGRESS',
            desc: 'TelcoMap autonomous failover engine activates Starlink Low-Earth-Orbit satellite gateway. Interface ge-0/0/2 brought up.',
          },
        ]);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (drillStep === 3) {
      const timer = setTimeout(() => {
        setDrillStep(4);
        setDrillLogs((prev) => [
          prev[0],
          prev[1],
          { ...prev[2], status: 'DONE' },
          {
            step: 4,
            title: 'Step 4: Sub-Second Packet Flow Restored (38ms Latency)',
            time: 'T+00.23s',
            status: 'IN_PROGRESS',
            desc: 'Ping verification successful. Traffic flowing seamlessly over LEO constellation. 0 enterprise connections dropped.',
          },
        ]);
      }, 2200);
      return () => clearTimeout(timer);
    }

    if (drillStep === 4) {
      const timer = setTimeout(() => {
        setDrillStep(5);
        setDrillLogs((prev) => [
          prev[0],
          prev[1],
          prev[2],
          { ...prev[3], status: 'DONE' },
          {
            step: 5,
            title: 'Step 5: Automated 4x4 Rigging Truck Roll Dispatched',
            time: 'T+00.30s',
            status: 'DONE',
            desc: 'Work Order WO-2026-6706 auto-generated. Southern Province Heavy Rigging Unit 3 rolling with OTDR & fusion splicers (ETA: 1h 35m).',
          },
        ]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [drillActive, drillStep]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Disaster Recovery &amp; Autonomous LEO Failover Simulator
              </h1>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                Chaos Engineering Drill
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Live sub-second disaster recovery demonstration for enterprise clients. Simulates physical primary backhaul severing and demonstrates autonomous Starlink LEO failover with zero BSS SLA penalty exposure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!drillActive ? (
              <button
                onClick={startDrill}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Optical Fibre Sever</span>
              </button>
            ) : (
              <button
                onClick={resetDrill}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Node & Financial Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Site Information */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              Simulation Target Hub
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {livingstoneSite?.siteCode} &bull; {livingstoneSite?.siteName}
            </h3>
            <div className="text-xs text-slate-400">{livingstoneSite?.city}, Zambia</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Primary Backhaul:</span>
                <span className="font-mono font-semibold text-rose-400">
                  {drillStep >= 1 ? 'DWDM FIBRE (SEVERED)' : 'DWDM FIBRE (ACTIVE)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Secondary Backup:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {drillStep >= 3 ? 'STARLINK LEO SATELLITE (ONLINE)' : 'STARLINK LEO SATELLITE (STANDBY)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Enterprise Tenant:</span>
                <span className="text-slate-200 font-medium">Livingstone Tourism &amp; Royal Livingstone</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Monthly Contract MRR:</span>
                <span className="font-mono font-bold text-emerald-400">$28,500 USD</span>
              </div>
            </div>

            {/* SLA Protection Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>BSS SLA Penalty Protection</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Without sub-second LEO failover, this fiber cut would cause a 4-hour outage costing{' '}
                <strong className="text-rose-400 font-mono">$2,850 USD</strong> in SLA penalties. With TelcoMap, failover completed in{' '}
                <strong className="text-emerald-400 font-mono">230 milliseconds</strong> with $0 revenue penalty!
              </p>
            </div>

            {livingstoneSite && (
              <button
                onClick={() => {
                  onSelectSite(livingstoneSite);
                  onNavigateToMap();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Inspect Target on GIS Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Live Execution Timeline */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Live Autonomous Failover Timeline</h2>
              <p className="text-xs text-slate-400">
                Real-time millisecond progression from optical loss detection to LEO routing and truck roll.
              </p>
            </div>
            {drillActive && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono animate-pulse">
                <span>DRILL STEP {drillStep} OF 5</span>
              </div>
            )}
          </div>

          {!drillActive && drillLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <Zap className="w-10 h-10 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">Disaster Simulator Ready</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Simulate Optical Fibre Sever" above to initiate the live 5-step carrier failover sequence and watch TelcoMap correlate OSS alarms to BSS SLA protection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {drillLogs.map((log) => (
                <div
                  key={log.step}
                  className={`p-4 rounded-xl border transition-all ${
                    log.status === 'DONE'
                      ? 'bg-slate-950/70 border-emerald-500/30 shadow-md'
                      : 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/40 animate-pulse'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          log.status === 'DONE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {log.status === 'DONE' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4 animate-spin" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{log.title}</span>
                          <span className="font-mono text-[10px] text-sky-400 bg-slate-900 px-1.5 py-0.5 rounded">
                            {log.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.desc}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                        log.status === 'DONE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
