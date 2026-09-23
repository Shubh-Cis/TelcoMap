import React, { useState } from 'react';
import { X, Plus, MapPin, Radio, Wifi, Server, Sparkles, AlertCircle } from 'lucide-react';
import { networkApi } from '../services/networkApi';
import { Site, ConnectivityTechnology, OperationalStatus } from '../types/network';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: (newSite: Site) => void;
}

// Preset strategic coordinates across Zambia for 1-click convenience
const ZAMBIA_PRESETS = [
  { label: 'Kitwe (Mining Hub)', city: 'Kitwe', region: 'Copperbelt', lat: -12.8024, lon: 28.2132, tech: 'FOUR_G', backup: 'FIBRE' },
  { label: 'Chipata (Eastern Border)', city: 'Chipata', region: 'Eastern Province', lat: -13.6444, lon: 32.6447, tech: 'FOUR_G', backup: 'MICROWAVE' },
  { label: 'Mongu (Western Region)', city: 'Mongu', region: 'Western Province', lat: -15.2484, lon: 23.1274, tech: 'FOUR_G', backup: 'SATELLITE' },
  { label: 'Kasama (Northern Corridor)', city: 'Kasama', region: 'Northern Province', lat: -10.2129, lon: 31.1808, tech: 'FOUR_G', backup: 'SATELLITE' },
];

export const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, onSiteCreated }) => {
  const [siteCode, setSiteCode] = useState('');
  const [siteName, setSiteName] = useState('');
  const [country, setCountry] = useState('Zambia');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [primaryTech, setPrimaryTech] = useState<ConnectivityTechnology>('FOUR_G');
  const [backupTech, setBackupTech] = useState<string>('SATELLITE');
  const [status, setStatus] = useState<OperationalStatus>('HEALTHY');

  // Device fields
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('ROUTER');
  const [deviceVendor, setDeviceVendor] = useState('Cisco');
  const [deviceModel, setDeviceModel] = useState('ISR 4331');
  const [deviceIp, setDeviceIp] = useState('10.10.6.1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof ZAMBIA_PRESETS[0]) => {
    setCity(preset.city);
    setRegion(preset.region);
    setLatitude(preset.lat.toString());
    setLongitude(preset.lon.toString());
    setPrimaryTech(preset.tech as ConnectivityTechnology);
    setBackupTech(preset.backup);
    if (!siteName) setSiteName(`${preset.city} Regional POP`);
    if (!deviceName) setDeviceName(`${preset.city} Edge Gateway`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!siteCode.trim()) {
      setError('Please enter a unique Site Code (e.g. ZM-006)');
      return;
    }
    if (!siteName.trim()) {
      setError('Please enter a Site Name');
      return;
    }
    if (!city.trim()) {
      setError('Please specify the City / Location');
      return;
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      setError('Latitude and Longitude must be valid numerical coordinates');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        siteCode: siteCode.trim().toUpperCase(),
        siteName: siteName.trim(),
        country: country.trim() || 'Zambia',
        region: region.trim() || 'General',
        city: city.trim(),
        latitude: lat,
        longitude: lon,
        status,
        primaryTech,
        backupTech: backupTech === 'NONE' ? null : backupTech,
        device: deviceName.trim()
          ? {
              deviceCode: `DEV-${siteCode.trim().toUpperCase()}-01`,
              name: deviceName.trim(),
              type: deviceType,
              vendor: deviceVendor,
              model: deviceModel,
              ipAddress: deviceIp.trim() || '10.10.10.1',
              status: status === 'CRITICAL' ? 'OFFLINE' : status === 'DEGRADED' ? 'DEGRADED' : 'ONLINE',
            }
          : undefined,
      };

      const newSite = await networkApi.createSite(payload);
      onSiteCreated(newSite);
      onClose();
    } catch (err: any) {
      console.error('Failed to create site:', err);
      setError(err?.message || 'Error provisioning network site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Provision New Network Site</h3>
              <p className="text-xs text-slate-400">
                Register a new physical tower, hub, or satellite station to the national NOC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Selector */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Zambia Geographic Presets:
              </span>
              <span className="text-[10px] text-slate-500">Auto-fill coordinates</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ZAMBIA_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.city}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-sky-500/20 hover:border-sky-500/50 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium text-left transition-all"
                >
                  <div className="font-bold truncate">{preset.city}</div>
                  <div className="text-[10px] text-slate-500 truncate">{preset.region}</div>
                </button>
              ))}
            </div>
          </div>

          {/* General Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              1. Site Identification &amp; Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Site Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ZM-006"
                  value={siteCode}
                  onChange={(e) => setSiteCode(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Site Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kitwe Industrial Hub"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  City / Town <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kitwe"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Province / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Copperbelt Province"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Latitude (GPS) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. -12.8024"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Longitude (GPS) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 28.2132"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Connectivity & Operational Health */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              2. Multi-Access Transport &amp; Health State
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Primary Technology</label>
                <select
                  value={primaryTech}
                  onChange={(e) => setPrimaryTech(e.target.value as ConnectivityTechnology)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="FIVE_G">5G Core / NR</option>
                  <option value="FOUR_G">4G LTE Access</option>
                  <option value="FIBRE">Fibre Optic Backhaul</option>
                  <option value="MICROWAVE">Microwave Radio</option>
                  <option value="SATELLITE">Satellite VSAT</option>
                  <option value="HYBRID">Hybrid Multi-Link</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Backup Backhaul</label>
                <select
                  value={backupTech}
                  onChange={(e) => setBackupTech(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="SATELLITE">Satellite VSAT (Starlink/OneWeb)</option>
                  <option value="FIBRE">Fibre Redundancy</option>
                  <option value="MICROWAVE">Microwave Backup</option>
                  <option value="FOUR_G">4G Cellular Failover</option>
                  <option value="NONE">No Redundant Backup</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Initial Health Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OperationalStatus)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="HEALTHY">🟢 HEALTHY (Normal)</option>
                  <option value="DEGRADED">🟡 DEGRADED (High Jitter/Latency)</option>
                  <option value="CRITICAL">🔴 CRITICAL (Link Outage)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Initial Hardware Device */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>3. Deployed Hardware (Optional)</span>
              <span className="text-[10px] text-slate-500 font-normal">Auto-registers initial router/terminal</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Edge Core Router"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Hardware Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="ROUTER">Core/Edge Router</option>
                  <option value="GATEWAY">Cellular Gateway</option>
                  <option value="SATELLITE_TERMINAL">Satellite Terminal (VSAT/Dishy)</option>
                  <option value="MICROWAVE_RADIO">Microwave Backhaul Radio</option>
                  <option value="FIBRE_SWITCH">Optical Fibre Switch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Vendor &amp; Model</label>
                <input
                  type="text"
                  placeholder="e.g. Cisco ASR 9001"
                  value={`${deviceVendor} ${deviceModel}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setDeviceVendor(parts[0] || 'Generic');
                    setDeviceModel(parts.slice(1).join(' ') || 'Standard');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Provisioning Site...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Register Site to NOC</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
