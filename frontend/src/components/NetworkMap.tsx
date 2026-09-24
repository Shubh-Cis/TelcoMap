import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Site, OperationalStatus } from '../types/network';

interface NetworkMapProps {
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site) => void;
  isFailoverActive?: boolean;
}

interface BackboneRoute {
  id: string;
  name: string;
  type: 'FIBRE' | 'MICROWAVE' | 'SATELLITE';
  capacity: string;
  coords: [number, number][];
  defaultColor: string;
}

// Converged national transmission routes across Zambia
const BACKBONE_ROUTES: BackboneRoute[] = [
  {
    id: 'route-core-north',
    name: 'Lusaka ↔ Ndola Core DWDM Fibre Backbone',
    type: 'FIBRE',
    capacity: '100 Gbps Core Backbone Ring',
    coords: [
      [-15.3875, 28.3228], // Lusaka Central Hub ZM-001
      [-14.4469, 28.4464], // Kabwe Rural Outpost ZM-003
      [-12.9688, 28.6366], // Ndola Regional Hub ZM-002
    ],
    defaultColor: '#0ea5e9', // Sky blue
  },
  {
    id: 'route-copperbelt-ring',
    name: 'Ndola ↔ Kitwe Mining Optical Metro Ring',
    type: 'FIBRE',
    capacity: '40 Gbps Metro Ring (99.99% SLA)',
    coords: [
      [-12.9688, 28.6366], // Ndola ZM-002
      [-12.8024, 28.2132], // Kitwe Industrial Hub ZM-006
    ],
    defaultColor: '#10b981', // Emerald green
  },
  {
    id: 'route-solwezi-mining',
    name: 'Kitwe ↔ Solwezi Kansanshi Mining Backhaul',
    type: 'MICROWAVE',
    capacity: '10 Gbps Long-Haul Radio Relay',
    coords: [
      [-12.8024, 28.2132], // Kitwe ZM-006
      [-12.1688, 26.3894], // Solwezi Outskirts ZM-004
    ],
    defaultColor: '#f59e0b', // Amber
  },
  {
    id: 'route-livingstone-primary',
    name: 'Lusaka ↔ Livingstone Border Transit Trunk',
    type: 'FIBRE',
    capacity: '10 Gbps Terrestrial 4G/Fibre Trunk',
    coords: [
      [-15.3875, 28.3228], // Lusaka ZM-001
      [-16.6, 27.1],       // Southern Transit Relay
      [-17.8419, 25.8544], // Livingstone Border ZM-005
    ],
    defaultColor: '#0ea5e9', // Sky blue
  },
  {
    id: 'route-livingstone-satellite',
    name: 'Eutelsat OneWeb LEO Satellite Beam (NTN)',
    type: 'SATELLITE',
    capacity: '250 Mbps CIR Low-Latency LEO Space Relay',
    coords: [
      [-15.3875, 28.3228], // Lusaka Gateway
      [-16.4, 25.9],       // LEO Space Segment Arc
      [-17.8419, 25.8544], // Livingstone Terminal ZM-005
    ],
    defaultColor: '#a855f7', // Purple
  },
];

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
  isFailoverActive = false,
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

        {/* Converged Transport Backhaul Lines (Fibre, Microwave, Satellite) */}
        {BACKBONE_ROUTES.flatMap((route) => {
          const isCut = route.id === 'route-livingstone-primary' && isFailoverActive;
          const isSatActive = route.id === 'route-livingstone-satellite' && isFailoverActive;
          const isSatStandby = route.id === 'route-livingstone-satellite' && !isFailoverActive;

          let color = route.defaultColor;
          let weight = 3.5;
          let opacity = 0.85;
          let dashArray: string | undefined = undefined;

          if (isCut) {
            color = '#ef4444';
            dashArray = '8, 8';
            weight = 4;
            opacity = 1.0;
          } else if (isSatActive) {
            color = '#c084fc';
            dashArray = '6, 6';
            weight = 4.5;
            opacity = 1.0;
          } else if (isSatStandby) {
            color = '#818cf8';
            dashArray = '4, 8';
            weight = 2;
            opacity = 0.4;
          }

          return LONGITUDE_OFFSETS.map((offset) => {
            const offsetCoords = route.coords.map(([lat, lng]) => [lat, lng + offset] as [number, number]);
            return (
              <Polyline
                key={`${route.id}-w${offset}`}
                positions={offsetCoords}
                pathOptions={{
                  color,
                  weight,
                  opacity,
                  dashArray,
                }}
              >
                <Tooltip sticky direction="top" opacity={0.95}>
                  <div className="text-xs font-semibold px-1.5 py-1">
                    <div className="text-white font-bold">{route.name}</div>
                    <div className="text-slate-300 font-normal mt-0.5">
                      Type: <span className="font-semibold text-sky-400">{route.type}</span> &bull; {route.capacity}
                    </div>
                    {isCut && (
                      <div className="text-rose-400 font-bold mt-1 flex items-center gap-1">
                        <span>⚠️ SEVERED: Primary terrestrial link cut</span>
                      </div>
                    )}
                    {isSatActive && (
                      <div className="text-purple-300 font-bold mt-1 flex items-center gap-1">
                        <span>⚡ SDN ACTIVE: Live traffic routed over Satellite VSAT</span>
                      </div>
                    )}
                    {isSatStandby && (
                      <div className="text-indigo-300 text-[10px] mt-0.5">
                        Hot-Standby Redundant Satellite NTN Path
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Polyline>
            );
          });
        })}

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

        {/* Converged Transport Backhaul Legend */}
        <div className="font-semibold text-slate-300 mt-2.5 pt-2 border-t border-slate-800 mb-1.5 flex items-center justify-between">
          <span>Transport Links</span>
          {isFailoverActive && (
            <span className="text-[9px] text-amber-400 font-bold px-1.5 py-0.5 bg-amber-950/80 rounded border border-amber-500/40">
              FAILOVER LIVE
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-sky-400 rounded-full inline-block"></span>
            <span className="text-slate-300">DWDM Fibre Backbone (100G)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-emerald-400 rounded-full inline-block"></span>
            <span className="text-slate-300">Metro Mining Ring (40G)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-amber-400 rounded-full inline-block"></span>
            <span className="text-slate-300">Long-Haul Microwave Relay</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-4 h-0.5 border-b-2 border-dashed inline-block ${
                isFailoverActive ? 'border-purple-300 animate-pulse' : 'border-purple-400'
              }`}
            ></span>
            <span className={isFailoverActive ? 'text-purple-300 font-bold' : 'text-slate-300'}>
              Satellite NTN (OneWeb) {isFailoverActive ? '● [ACTIVE]' : '● [Standby]'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
