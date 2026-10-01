import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Lock,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import { BssContract, Site } from '../types/network';
import { networkApi } from '../services/networkApi';

interface BssDashboardProps {
  sites: Site[];
  onSelectSite: (site: Site) => void;
  onNavigateToChaos: () => void;
}

export function BssDashboard({ sites, onSelectSite, onNavigateToChaos }: BssDashboardProps) {
  const [contracts, setContracts] = useState<BssContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedContract, setSelectedContract] = useState<BssContract | null>(null);

  const loadBssData = async () => {
    try {
      setLoading(true);
      const res = await networkApi.getBssContracts().catch(() => null);
      if (res?.contracts) {
        setContracts(res.contracts);
        if (!selectedContract && res.contracts.length > 0) {
          setSelectedContract(res.contracts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load BSS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBssData();
  }, []);

  const totalMrr = contracts.reduce((acc, c) => acc + c.monthlyRevenueUsd, 0);
  const affectedContracts = contracts.filter((c) => {
    const site = sites.find((s) => s.id === c.siteId || s.siteCode === c.site?.siteCode);
    return site ? site.status !== 'HEALTHY' : c.site?.status !== 'HEALTHY';
  });
  const revenueAtRisk = affectedContracts.reduce((acc, c) => acc + c.monthlyRevenueUsd, 0);
  const complianceRate = contracts.length > 0
    ? Math.round(((contracts.length - affectedContracts.length) / contracts.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Enterprise BSS Revenue &amp; SLA Governance
              </h1>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                TM Forum SID Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Commercial billing, SLA penalty exposure modeling, and ZICTA regulatory sovereignty tracking. Directly ties physical network outages to dollar impact and contractual SLA penalties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadBssData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh BSS</span>
            </button>
            <button
              onClick={onNavigateToChaos}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Test SLA Failover Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BSS High-Level Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total MRR */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Contracted MRR (Portfolio)
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              ${totalMrr.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD/mo</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>5 Enterprise Anchor Tenants</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Revenue at Risk */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Revenue at Risk (Active Outage)
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              ${revenueAtRisk.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
            </div>
            <div className="text-[10px] text-amber-400/80 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{affectedContracts.length} Site In Failover Mode</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: SLA Compliance Rate */}
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              Portfolio SLA Compliance
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{complianceRate}%</div>
            <div className="text-[10px] text-sky-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Target: &gt;99.90% Across Tiers</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: ZICTA Sovereign Status */}
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              ZICTA Sovereign Audit
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">100% COMPLIANT</div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span>NLIC Lawful Intercept Certified</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Table + Right SLA Detail Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Enterprise Customers Table */}
        <div className="xl:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Enterprise SLA Contracts Portfolio</h2>
              <p className="text-xs text-slate-400">
                Click any corporate customer to view their real-time SLA penalty model, ZICTA license, and failover status.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-950/40">
                  <th className="py-3 px-3">Enterprise Client</th>
                  <th className="py-3 px-3">Industry Vertical</th>
                  <th className="py-3 px-3">POP Location</th>
                  <th className="py-3 px-3">Contract Tier</th>
                  <th className="py-3 px-3">MRR (USD)</th>
                  <th className="py-3 px-3">SLA Target</th>
                  <th className="py-3 px-3 text-right">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contracts.map((contract) => {
                  const matchingSite = sites.find(
                    (s) => s.id === contract.siteId || s.siteCode === contract.site?.siteCode
                  );
                  const isSelected = selectedContract?.id === contract.id;
                  const isSiteHealthy = (matchingSite?.status || contract.site?.status) === 'HEALTHY';

                  return (
                    <tr
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-500/10 border-l-2 border-sky-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{contract.clientName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{contract.industry}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-300">{contract.industry}</td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-sky-400">
                          {contract.site?.siteCode || matchingSite?.siteCode}
                        </span>{' '}
                        <span className="text-slate-400">({contract.site?.city || matchingSite?.city})</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {contract.contractTier}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        ${contract.monthlyRevenueUsd.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                        {contract.slaTargetPercent}%
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                            isSiteHealthy
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {isSiteHealthy ? '100% IN SLA' : 'FAILOVER MODE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Contract SLA Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {selectedContract ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    BSS Agreement Profile
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedContract.clientName}</h3>
                  <div className="text-[11px] text-slate-400">{selectedContract.contractTier}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Monthly Billing</div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    ${selectedContract.monthlyRevenueUsd.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* SLA Target vs Actual */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Contracted Uptime Target:</span>
                  <span className="font-mono font-bold text-white">{selectedContract.slaTargetPercent}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Maximum Allowed Downtime/Mo:</span>
                  <span className="font-mono text-slate-300">43.2 Minutes</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Current Month Performance:</span>
                  <span className="font-mono text-emerald-400 font-bold">99.98% (Compliant)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Credit Penalty Formula:</span>
                  <span className="font-mono text-amber-400">10% MRR credit if &lt;99.9%</span>
                </div>
              </div>

              {/* Data Sovereignty & Lawful Interception */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Data Sovereignty &amp; NLIC Probe Status</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Data Breakout Routing:</span>
                    <span className="text-slate-200 font-medium">{selectedContract.dataSovereignty}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">National Security Compliance:</span>
                    <span className="text-emerald-400 font-mono text-[10px]">{selectedContract.lawfulInterceptionStatus}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">ZICTA Spectrum / NTN License:</span>
                    <span className="text-sky-300 font-mono text-[10px]">{selectedContract.zictaLicense}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {(() => {
                  const match = sites.find(
                    (s) => s.id === selectedContract.siteId || s.siteCode === selectedContract.site?.siteCode
                  );
                  return (
                    match && (
                      <button
                        onClick={() => onSelectSite(match)}
                        className="w-full py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <span>Inspect Site Hardware &amp; Alarms</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an enterprise customer contract to inspect its SLA provisions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
