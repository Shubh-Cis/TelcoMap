import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Site, OperationalStatus } from '../types/network';

interface NetworkMapProps {
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site) => void;
}

// Controller component to smoothly fly to selected site on the map
const MapController: React.FC<{ selectedSite: Site | null }> = ({ selectedSite }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedSite) {
      map.flyTo([selectedSite.latitude, selectedSite.longitude], 8, {
        duration: 1.2,
      });
    }
  }, [selectedSite, map]);

  return null;
};

// Generates custom SVG pin based on operational status
const createStatusIcon = (status: OperationalStatus, isSelected: boolean) => {
  const colors: Record<OperationalStatus, { bg: string; border: string; glow: string; ping: string }> = {
    HEALTHY: {
      bg: '#10b981',
      border: '#059669',
      glow: 'rgba(16, 185, 129, 0.4)',
      ping: 'bg-emerald-400',
    },
    DEGRADED: {
      bg: '#f59e0b',
      border: '#d97706',
      glow: 'rgba(245, 158, 11, 0.4)',
      ping: 'bg-amber-400',
    },
    CRITICAL: {
      bg: '#ef4444',
      border: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.6)',
      ping: 'bg-rose-500',
    },
  };

  const style = colors[status] || colors.HEALTHY;
  const size = isSelected ? 38 : 30;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        status === 'CRITICAL' || isSelected
          ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${style.bg}; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
          : ''
      }
      <div style="
        position: relative;
        width: ${size - 8}px;
        height: ${size - 8}px;
        background: ${style.bg};
        border: 2px solid ${isSelected ? '#ffffff' : style.border};
        border-radius: 50%;
        box-shadow: 0 0 12px ${style.glow};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-noc-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export const NetworkMap: React.FC<NetworkMapProps> = ({
  sites,
  selectedSite,
  onSelectSite,
}) => {
  // Centered roughly over Zambia (Lusaka - Ndola corridor)
  const defaultCenter: [number, number] = [-14.5, 27.8];
  const defaultZoom = 6;

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
      >
        {/* Sleek Dark CartoDB Matter Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController selectedSite={selectedSite} />

        {sites.map((site) => {
          const isSelected = selectedSite?.id === site.id;
          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={createStatusIcon(site.status, isSelected)}
              eventHandlers={{
                click: () => onSelectSite(site),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-xs font-semibold px-1 py-0.5">
                  <div className="text-white font-bold">{site.siteCode}: {site.siteName}</div>
                  <div className="text-slate-400 font-normal">{site.city}, {site.country}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        site.status === 'HEALTHY'
                          ? 'bg-emerald-500'
                          : site.status === 'DEGRADED'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[10px] uppercase font-bold text-slate-300">
                      {site.status}
                    </span>
                  </div>
                </div>
              </Tooltip>

              <Popup className="noc-map-popup">
                <div className="p-2 text-slate-900 min-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1 mb-1">
                    <span className="font-bold text-sm text-slate-800">{site.siteCode}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        site.status === 'HEALTHY'
                          ? 'bg-emerald-600'
                          : site.status === 'DEGRADED'
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">{site.siteName}</div>
                  <div className="text-xs text-slate-500 mb-2">
                    {site.city} &bull; {site.region}
                  </div>
                  <div className="text-[11px] bg-slate-100 p-1.5 rounded mb-2 space-y-0.5">
                    <div>
                      <span className="font-semibold text-slate-700">Primary:</span>{' '}
                      <span className="text-sky-700 font-medium">{site.primaryTech}</span>
                    </div>
                    {site.backupTech && (
                      <div>
                        <span className="font-semibold text-slate-700">Backup:</span>{' '}
                        <span className="text-indigo-700 font-medium">{site.backupTech}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-slate-700">Devices:</span>{' '}
                      <span>{site.devices?.length || 0} active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectSite(site)}
                    className="w-full text-xs font-semibold py-1 bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors text-center"
                  >
                    Inspect Site Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs shadow-xl pointer-events-auto">
        <div className="font-semibold text-slate-300 mb-1.5">Network Node Status</div>
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Healthy (Normal latency/loss)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Degraded (High latency / Jitter)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-slate-300">Critical (Link outage / Loss &gt; 8%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
