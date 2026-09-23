import React, { useState, useEffect } from 'react';
import { X, MapPin, Radio, Wifi, Server, CheckCircle2, AlertTriangle, AlertOctagon, Sparkles, RefreshCw, Copy, Check, ShieldAlert } from 'lucide-react';
import { Site, ConnectivityTechnology, AiDiagnosisResult } from '../types/network';
import { networkApi } from '../services/networkApi';

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
  const [diagnosis, setDiagnosis] = useState<AiDiagnosisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  // Reset diagnosis when selected site changes
  useEffect(() => {
    setDiagnosis(null);
    setErrorAi(null);
  }, [site?.id]);

  if (!site) return null;

  const isHealthy = site.status === 'HEALTHY';
  const isDegraded = site.status === 'DEGRADED';
  const isCritical = site.status === 'CRITICAL';

  const primaryBadge = getTechBadge(site.primaryTech);
  const backupBadge = site.backupTech ? getTechBadge(site.backupTech) : null;

  const handleRunDiagnosis = async () => {
    try {
      setLoadingAi(true);
      setErrorAi(null);
      const res = await networkApi.diagnoseSite(site.siteCode);
      setDiagnosis(res);
    } catch (err: any) {
      console.error('Failed to run AI diagnosis:', err);
      setErrorAi(err?.message || 'Unable to complete AI diagnosis');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopyTicket = () => {
    if (!diagnosis?.incidentDraft) return;
    const draft = diagnosis.incidentDraft;
    const text = `=== TELECOM NOC INCIDENT DRAFT ===
Ticket ID: ${draft.incidentCode}
Title: ${draft.incidentTitle}
Severity: ${draft.severity}
Assigned Queue: ${draft.assignedTeam}
Site: ${diagnosis.siteCode} (${diagnosis.siteName})
Status: ${diagnosis.status}

PROBABLE ROOT CAUSE:
${diagnosis.probableRootCause}

SLA IMPACT:
${diagnosis.slaImpact}

DESCRIPTION:
${draft.description}

IMMEDIATE TRIAGE STEPS:
${draft.immediateActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Synthesized by: ${diagnosis.modelUsed}
==================================`;

    navigator.clipboard.writeText(text);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

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

      {/* AI Root-Cause Diagnostic Copilot Section */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Root-Cause Copilot</span>
          </div>

          <button
            onClick={handleRunDiagnosis}
            disabled={loadingAi}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              !diagnosis
                ? isCritical
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 animate-pulse'
                  : isDegraded
                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
                  : 'bg-sky-500 hover:bg-sky-400 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-3 h-3 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>{loadingAi ? 'Analyzing Link...' : diagnosis ? 'Re-Analyze' : '⚡ Run Diagnostic'}</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorAi && (
          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorAi}</span>
            <button
              onClick={handleRunDiagnosis}
              className="text-[11px] underline font-bold hover:text-white ml-2 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Diagnosis Results */}
        {diagnosis && (
          <div className="pt-2 border-t border-slate-850 space-y-2 text-xs animate-in fade-in duration-150">
            {/* Root Cause */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Probable Engineering Root Cause
              </span>
              <p className="text-slate-200 text-xs leading-relaxed">
                {diagnosis.probableRootCause}
              </p>
            </div>

            {/* SLA Impact */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SLA &amp; Business Impact
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {diagnosis.slaImpact}
              </p>
            </div>

            {/* Action Checklist */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Prescribed Field &amp; NOC Remediation
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {diagnosis.recommendedActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions: Copy Incident Draft */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleCopyTicket}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                title="Copy formatted incident report for ticketing system"
              >
                {copiedTicket ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Incident Draft!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Incident Draft</span>
                  </>
                )}
              </button>

              <span className="text-[10px] text-slate-500 font-mono">
                {diagnosis.modelUsed.split(' ')[0]} ({diagnosis.confidenceScore}% conf.)
              </span>
            </div>
          </div>
        )}
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
