import React from 'react';
import { X, MapPin, Radio, Wifi, Server, CheckCircle2, AlertTriangle, AlertOctagon, Globe } from 'lucide-react';
import { Site, ConnectivityTechnology } from '../types/network';

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
  if (!site) return null;

  const isHealthy = site.status === 'HEALTHY';
  const isDegraded = site.status === 'DEGRADED';
  const isCritical = site.status === 'CRITICAL';

  const primaryBadge = getTechBadge(site.primaryTech);
  const backupBadge = site.backupTech ? getTechBadge(site.backupTech) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Header with Site Code and Close */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
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
          <h2 className="text-lg font-bold text-white">{site.siteName}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Location Details & Coordinates */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
        <div>
          <span className="text-slate-500 block mb-0.5">Location</span>
          <div className="flex items-center gap-1 text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              {site.city}, {site.region}
            </span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">Country &amp; Coordinates</span>
          <div className="text-slate-200 font-mono text-[11px]">
            {site.country} &bull; {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Connectivity Technologies */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-sky-400" />
          Network Transport Links
        </div>
        <div className="flex flex-wrap gap-2">
          <div className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${primaryBadge.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>Primary: {primaryBadge.label}</span>
          </div>
          {backupBadge && (
            <div className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${backupBadge.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>Backup: {backupBadge.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Deployed Devices at Site */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            Site Devices ({site.devices?.length || 0})
          </span>
          <span className="text-[11px] text-slate-500 font-normal">Physical / Logical Hardware</span>
        </div>

        <div className="space-y-2">
          {site.devices?.map((dev) => (
            <div
              key={dev.id}
              className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
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
  );
};
