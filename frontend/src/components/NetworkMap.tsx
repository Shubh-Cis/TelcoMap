import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Site, OperationalStatus } from '../types/network';

interface NetworkMapProps {
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site) => void;
}

// Controller component to smoothly fly to selected site on the map or recenter
const MapController: React.FC<{ selectedSite: Site | null; resetCount: number }> = ({
  selectedSite,
  resetCount,
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedSite) {
      map.flyTo([selectedSite.latitude, selectedSite.longitude], 8, {
        duration: 1.2,
      });
    }
  }, [selectedSite, map]);

  useEffect(() => {
    if (resetCount > 0) {
      map.flyTo([-14.5, 27.8], 6, {
        duration: 1.0,
      });
    }
  }, [resetCount, map]);

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
  const [mapTheme, setMapTheme] = React.useState<'dark' | 'standard'>('dark');
  const [resetCount, setResetCount] = React.useState<number>(0);

  // Centered roughly over Zambia (Lusaka - Ndola corridor)
  const defaultCenter: [number, number] = [-14.5, 27.8];
  const defaultZoom = 6;

  // Render markers across adjacent world copies so zooming out or dragging left/right never loses pinpoints
  const LONGITUDE_OFFSETS = [0, -360, 360];

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Control Toolbar */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-xs shadow-xl pointer-events-auto flex items-center gap-1.5">
        <button
          onClick={() => setResetCount((c) => c + 1)}
          className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 transition-colors flex items-center gap-1 border border-slate-700/60"
          title="Recenter Map View on Zambia"
        >
          <span>🇿🇲 Recenter</span>
        </button>
        <button
          onClick={() => setMapTheme('dark')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            mapTheme === 'dark'
              ? 'bg-sky-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
          title="NOC Dark Mode (Pure OpenStreetMap with CSS filter)"
        >
          NOC Dark
        </button>
        <button
          onClick={() => setMapTheme('standard')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            mapTheme === 'standard'
              ? 'bg-sky-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Standard Full-Color OpenStreetMap"
        >
          Standard OSM
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={4}
        maxZoom={18}
        worldCopyJump={true}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tile Layer (100% Free & Open Source - No API Key Required) */}
        <TileLayer
          key={mapTheme}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={mapTheme === 'dark' ? 'dark-map-tiles' : ''}
          maxZoom={19}
        />

        <MapController selectedSite={selectedSite} resetCount={resetCount} />

        {sites.flatMap((site) => {
          const isSelected = selectedSite?.id === site.id;
          return LONGITUDE_OFFSETS.map((offset) => (
            <Marker
              key={`${site.id}-w${offset}`}
              position={[site.latitude, site.longitude + offset]}
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onSelectSite(site);
                      const panel = document.getElementById('site-inspector-panel');
                      if (panel) {
                        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        panel.classList.add('ring-2', 'ring-sky-400');
                        setTimeout(() => panel.classList.remove('ring-2', 'ring-sky-400'), 1500);
                      }
                    }}
                    className="w-full text-xs font-semibold py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded transition-all text-center cursor-pointer shadow-md flex items-center justify-center gap-1 mt-1"
                  >
                    <span>Inspect Site Details &rarr;</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          ));
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
