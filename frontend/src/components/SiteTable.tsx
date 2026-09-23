import React from 'react';
import { Eye, MapPin, Radio, Wifi, Server, CheckCircle2, AlertTriangle, AlertOctagon, Plus } from 'lucide-react';
import { Site, OperationalStatus } from '../types/network';

interface SiteTableProps {
  sites: Site[];
  selectedFilter: OperationalStatus | 'ALL';
  onSelectFilter: (status: OperationalStatus | 'ALL') => void;
  onSelectSite: (site: Site) => void;
  selectedSiteId?: string;
  onOpenAddSite?: () => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({
  sites,
  selectedFilter,
  onSelectFilter,
  onSelectSite,
  selectedSiteId,
  onOpenAddSite,
}) => {
  const filteredSites = sites.filter((s) => {
    if (selectedFilter === 'ALL') return true;
    return s.status === selectedFilter;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            Network Site Inventory
          </h3>
          <p className="text-xs text-slate-400">
            Physical telecom POPs, cellular base stations, and edge hubs
          </p>
        </div>

        {/* Filter Pills & Add Site */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['ALL', 'HEALTHY', 'DEGRADED', 'CRITICAL'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => onSelectFilter(filter)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedFilter === filter
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {onOpenAddSite && (
            <button
              onClick={onOpenAddSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Site</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Site Identifier</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Primary Tech</th>
              <th className="px-4 py-3">Backup Tech</th>
              <th className="px-4 py-3">Operational Status</th>
              <th className="px-4 py-3">Devices</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredSites.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                  No network sites match filter "{selectedFilter}"
                </td>
              </tr>
            ) : (
              filteredSites.map((site) => {
                const isSelected = selectedSiteId === site.id;
                return (
                  <tr
                    key={site.id}
                    onClick={() => onSelectSite(site)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-500/10'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Site Code & Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-sky-400">{site.siteCode}</span>
                        <span>- {site.siteName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{site.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{site.region}, {site.country}</div>
                    </td>

                    {/* Primary Tech */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
                        <Wifi className="w-3 h-3" />
                        {site.primaryTech}
                      </span>
                    </td>

                    {/* Backup Tech */}
                    <td className="px-4 py-3 text-slate-400">
                      {site.backupTech ? (
                        <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                          {site.backupTech}
                        </span>
                      ) : (
                        <span className="text-slate-600">None</span>
                      )}
                    </td>

                    {/* Operational Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                          site.status === 'HEALTHY'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            : site.status === 'DEGRADED'
                            ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                            : 'bg-rose-950 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {site.status === 'HEALTHY' && <CheckCircle2 className="w-3 h-3" />}
                        {site.status === 'DEGRADED' && <AlertTriangle className="w-3 h-3" />}
                        {site.status === 'CRITICAL' && <AlertOctagon className="w-3 h-3 animate-pulse" />}
                        {site.status}
                      </span>
                    </td>

                    {/* Devices count */}
                    <td className="px-4 py-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3 text-indigo-400" />
                        {site.devices?.length || 0} devices
                      </span>
                    </td>

                    {/* Action button */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSite(site);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
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
  );
};
