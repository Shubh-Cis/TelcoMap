import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Copy,
  Check,
  Send,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Site, AiDiagnosisResult } from '../types/network';
import { networkApi } from '../services/networkApi';

interface AiOpsDashboardProps {
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site) => void;
  onOpenWeeklyReport: () => void;
}

export function AiOpsDashboard({
  sites,
  selectedSite,
  onSelectSite,
  onOpenWeeklyReport,
}: AiOpsDashboardProps) {
  const [activeSite, setActiveSite] = useState<Site>(selectedSite || sites[0]);
  const [diagnosis, setDiagnosis] = useState<AiDiagnosisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  const handleRunAiDiagnosis = async (siteToDiagnose = activeSite, promptText?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await networkApi.diagnoseSite(siteToDiagnose.siteCode, promptText);
      setDiagnosis(res);
    } catch (err: any) {
      console.error('Failed to run AI diagnosis:', err);
      setError(err?.message || 'AI Copilot diagnosis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTicket = () => {
    if (!diagnosis?.incidentDraft) return;
    const d = diagnosis.incidentDraft;
    const text = `=== CARRIER NOC INCIDENT DRAFT ===
Ticket ID: ${d.incidentCode}
Severity: ${d.severity}
Title: ${d.incidentTitle}
Assigned NOC Unit: ${d.assignedTeam}
Site Code: ${diagnosis.siteCode} (${diagnosis.siteName})
Root Cause: ${diagnosis.probableRootCause}
SLA Exposure: ${diagnosis.slaImpact}
Immediate Actions:
${d.immediateActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
==================================`;

    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                AIOps Autonomous Copilot &amp; Root-Cause Engine
              </h1>
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Gemini 2.5 Pro Neural Core
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time anomaly detection, correlation of optical attenuation, weather radar interference, and automatic TM Forum trouble ticketing.
            </p>
          </div>

          <button
            onClick={onOpenWeeklyReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Executive SLA Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Site Selector + Chat Input, Right Diagnostics Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Site Selector & Custom Inquiry */}
        <div className="lg:col-span-5 space-y-4">
          {/* Site Selector Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Network Hub to Diagnose
            </h2>

            <div className="space-y-2">
              {sites.map((s) => {
                const isSelected = activeSite?.id === s.id;
                const isHealthy = s.status === 'HEALTHY';

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSite(s);
                      onSelectSite(s);
                      setDiagnosis(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{s.siteCode}</span>
                        <span className="text-slate-400 font-normal">({s.city})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{s.siteName}</div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                        isHealthy
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      }`}
                    >
                      {s.status}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleRunAiDiagnosis(activeSite)}
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Telemetry...' : `Diagnose ${activeSite?.siteCode}`}</span>
            </button>
          </div>

          {/* Ask AI Copilot Custom Query */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Ask AI Telecom Copilot
              </h3>
            </div>

            <p className="text-[11px] text-slate-400">
              Submit custom operational queries or scenario inquiries about carrier transport, DWDM link attenuation, or BSS SLA penalties.
            </p>

            <div className="space-y-2">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. What is the impact if the Lusaka-Solwezi link experiences rain fade? How will LEO failover protect the FQM mining SLA?"
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Connected to NOC Telemetry</span>
                <button
                  onClick={() => customPrompt.trim() && handleRunAiDiagnosis(activeSite, customPrompt)}
                  disabled={loading || !customPrompt.trim()}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>Ask Copilot</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): AI Diagnosis Analysis & Auto-Ticket */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Diagnostic Insights &amp; Remediation</h2>
              <p className="text-xs text-slate-400">
                AI evaluation of telemetry, active alarms, and historical baseline.
              </p>
            </div>
            {diagnosis && (
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Confidence: {Math.round(diagnosis.confidenceScore * 100)}%
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-sm font-semibold text-slate-300">Neural Model Analyzing Network Telemetry...</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Correlating optical loss signals, BGP keepalive timers, and BSS SLA exposure formulas.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs">
              <div className="font-bold mb-1">Diagnostic Error</div>
              <p>{error}</p>
            </div>
          ) : diagnosis ? (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Operational Health Assessment
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{diagnosis.summary}</p>
              </div>

              {/* Probable Root Cause & SLA Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                  <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Probable Root Cause</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{diagnosis.probableRootCause}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SLA Financial Impact</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{diagnosis.slaImpact}</p>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Recommended Remediation Actions
                </div>
                <div className="space-y-1.5">
                  {diagnosis.recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident Draft Ticket */}
              {diagnosis.incidentDraft && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">
                        TM Forum Auto-Generated Ticket ({diagnosis.incidentDraft.incidentCode})
                      </span>
                    </div>

                    <button
                      onClick={handleCopyTicket}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                    >
                      {copiedDraft ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy Ticket'}</span>
                    </button>
                  </div>

                  <div className="font-mono text-[11px] text-slate-400 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <div>
                      <strong className="text-slate-300">Severity:</strong> {diagnosis.incidentDraft.severity} |{' '}
                      <strong className="text-slate-300">Team:</strong> {diagnosis.incidentDraft.assignedTeam}
                    </div>
                    <div className="text-white font-semibold">{diagnosis.incidentDraft.incidentTitle}</div>
                    <p className="text-slate-400 text-[10px] pt-1">{diagnosis.incidentDraft.description}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <Bot className="w-10 h-10 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">Ready for Telemetry Analysis</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a network site on the left and click "Diagnose" to trigger the live AIOps root-cause engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
