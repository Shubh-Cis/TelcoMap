import React from 'react';
import { Layers, Globe, Radio, Server, ArrowDown, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { TopologyData, Site } from '../types/network';

interface NetworkTopologyProps {
  topology: TopologyData | null;
  sites: Site[];
  onSelectSite: (site: Site) => void;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  topology,
  sites,
  onSelectSite,
}) => {
  if (!topology) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Loading network topology hierarchy...
      </div>
    );
  }

  // Group nodes by architectural tier
  const coreNodes = topology.nodes.filter((n) => n.type === 'CORE');
  const backboneNodes = topology.nodes.filter((n) => n.type === 'BACKBONE');
  const siteNodes = topology.nodes.filter((n) => n.type === 'SITE');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            End-to-End Telecom Network Topology
          </h3>
          <p className="text-xs text-slate-400">
            Data-driven hierarchy: Global Transit &rarr; National Core &rarr; Transport Backbones &rarr; Remote POP Sites &rarr; Hardware
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
          Nodes: {topology.nodes.length} &bull; Edges: {topology.edges.length}
        </div>
      </div>

      {/* TIER 1: CORE / INTERNET */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
          Tier 1: Global Transit &amp; National Core
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {coreNodes.map((node) => (
            <div
              key={node.id}
              className="bg-slate-950 border border-sky-500/40 p-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[240px]"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">{node.label}</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  OPERATIONAL
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONNECTOR ARROWS */}
      <div className="flex justify-center my-2 text-slate-600">
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </div>

      {/* TIER 2: TRANSPORT BACKBONES (FIBRE / MICROWAVE / SATELLITE) */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
          Tier 2: Multi-Access Transport Backbones
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {backboneNodes.map((node) => {
            const isDegraded = node.status === 'DEGRADED';
            const isCritical = node.status === 'CRITICAL';
            const isHealthy = !isDegraded && !isCritical;

            return (
              <div
                key={node.id}
                className={`p-3.5 rounded-lg border bg-slate-950 ${
                  isCritical
                    ? 'border-rose-500/50 shadow-rose-950/20'
                    : isDegraded
                    ? 'border-amber-500/50 shadow-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">{node.label}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHealthy
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                        : isDegraded
                        ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                        : 'bg-rose-950 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {node.id === 'transport-fibre' && 'Ultra-low latency redundant fibre rings (0-15ms)'}
                  {node.id === 'transport-microwave' && 'Line-of-sight RF towers (20-40ms, weather-prone)'}
                  {node.id === 'transport-satellite' && 'LEO/GEO constellation backhaul (80-800ms)'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONNECTOR ARROWS */}
      <div className="flex justify-center my-2 text-slate-600">
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </div>

      {/* TIER 3: REGIONAL NETWORK SITES & SUB-DEVICES */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
          Tier 3: Regional POP Sites &amp; Deployed Hardware
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => {
            const isHealthy = site.status === 'HEALTHY';
            const isDegraded = site.status === 'DEGRADED';
            const isCritical = site.status === 'CRITICAL';

            return (
              <div
                key={site.id}
                onClick={() => onSelectSite(site)}
                className={`bg-slate-950 border rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                  isCritical
                    ? 'border-rose-500/60 shadow-lg shadow-rose-950/30'
                    : isDegraded
                    ? 'border-amber-500/60 shadow-lg shadow-amber-950/30'
                    : 'border-slate-800 hover:border-sky-500/50'
                }`}
              >
                {/* Site Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-400">{site.siteCode}</span>
                    <h4 className="font-bold text-sm text-white">{site.siteName}</h4>
                    <span className="text-[11px] text-slate-400">{site.city}, {site.region}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHealthy
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                        : isDegraded
                        ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                        : 'bg-rose-950 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {site.status}
                  </span>
                </div>

                {/* Connectivity Links */}
                <div className="flex items-center gap-1.5 my-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Primary: {site.primaryTech}
                  </span>
                  {site.backupTech && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Backup: {site.backupTech}
                    </span>
                  )}
                </div>

                {/* Sub-Devices Tree */}
                <div className="border-t border-slate-850 pt-2 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Site Hardware:
                  </div>
                  {site.devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between text-[11px] bg-slate-900/80 px-2 py-1 rounded border border-slate-800/80"
                    >
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <Server className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{device.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          device.status === 'ONLINE'
                            ? 'text-emerald-400'
                            : device.status === 'DEGRADED'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
