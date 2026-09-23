import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert, Cpu, RefreshCw, Copy, Check, FileText } from 'lucide-react';
import { networkApi } from '../services/networkApi';
import { WeeklyNetworkReport } from '../types/network';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSite?: (siteCode: string) => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ isOpen, onClose, onSelectSite }) => {
  const [report, setReport] = useState<WeeklyNetworkReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await networkApi.getWeeklyReport();
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load weekly report:', err);
      setError(err?.message || 'Unable to generate weekly operations report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!report) return;
    const text = `=== TELECOM NOC WEEKLY OPERATIONS & FOCUS REPORT ===
Period: ${report.reportPeriod}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Network SLA Index: ${report.networkSlaPercent}%
Sites Overview: Total: ${report.totalSites} | Healthy: ${report.healthySitesCount} | Degraded: ${report.degradedSitesCount} | Critical: ${report.criticalSitesCount}

EXECUTIVE SUMMARY:
${report.executiveSummary}

PRIORITY SITES REQUIRING ATTENTION THIS WEEK:
${report.priorityFocusSites
  .map(
    (s, i) =>
      `${i + 1}. [${s.priorityLevel}] ${s.siteCode} - ${s.siteName} (${s.city})
   Technology: Primary: ${s.primaryTech} | Backup: ${s.backupTech || 'None'}
   Identified Issue: ${s.identifiedIssue}
   Recommended Field Action: ${s.recommendedAction}`,
  )
  .join('\n\n')}

TECHNOLOGY RELIABILITY:
${report.technologyReliabilityBreakdown
  .map((t) => `- ${t.technology}: ${t.reliabilityScore}% (${t.observation})`)
  .join('\n')}

WEEKLY FIELD RECOMMENDATIONS:
${report.weeklyFieldRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Engine: ${report.modelUsed}
===================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/30 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Weekly Operations &amp; Site Focus Report</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
                  AI-Synthesized
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated weekly audit identifying chronic technical issues and prioritized field truck rolls
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="font-semibold text-sm text-slate-200">
                Generating Weekly Operations &amp; Focus Report...
              </p>
              <p className="text-slate-400 text-xs max-w-sm">
                Correlating multi-access links across Zambia, evaluating chronic outages, and prioritizing engineering interventions.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 space-y-2">
              <div className="font-semibold flex items-center gap-2 text-sm">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Failed to Generate Report</span>
              </div>
              <p className="text-xs text-rose-400/90">{error}</p>
              <button
                onClick={fetchReport}
                className="mt-2 px-3 py-1 bg-rose-850 hover:bg-rose-750 text-white rounded text-xs font-semibold"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {!loading && report && (
            <>
              {/* Executive Summary Top Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-slate-500 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Report Period
                  </span>
                  <div className="text-sm font-bold text-white font-mono">{report.reportPeriod}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">National Scope</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-slate-500 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Core Network SLA
                  </span>
                  <div
                    className={`text-xl font-bold font-mono ${
                      report.networkSlaPercent >= 95
                        ? 'text-emerald-400'
                        : report.networkSlaPercent >= 80
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {report.networkSlaPercent}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Target: &gt;= 99.5%</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-slate-500 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Active Outages
                  </span>
                  <div className="text-xl font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 animate-pulse" />
                    <span>{report.criticalSitesCount} Site</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Needs immediate action</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-slate-500 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Degraded / Warning
                  </span>
                  <div className="text-xl font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{report.degradedSitesCount} Site</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High jitter / link latency</div>
                </div>
              </div>

              {/* Executive Assessment Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Executive Assessment &amp; SLA Status</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Priority Focus Sites (The Core User Requirement) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Sites Requiring Priority Focus This Week
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Ranked by severity and SLA impact
                  </span>
                </div>

                {report.priorityFocusSites.length === 0 ? (
                  <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-center">
                    All network sites operating within nominal SLA. No chronic failures detected this week.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.priorityFocusSites.map((site) => {
                      const isCrit = site.status === 'CRITICAL';
                      return (
                        <div
                          key={site.siteCode}
                          className={`p-4 rounded-xl border transition-all ${
                            isCrit
                              ? 'bg-slate-950 border-rose-500/50 shadow-md shadow-rose-950/20'
                              : 'bg-slate-950 border-amber-500/40 shadow-md shadow-amber-950/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                  isCrit ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {site.siteCode}
                              </span>
                              <span className="font-bold text-white text-sm">{site.siteName}</span>
                              <span className="text-slate-400 text-xs">({site.city})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  isCrit
                                    ? 'bg-rose-950 text-rose-400 border-rose-500/50'
                                    : 'bg-amber-950 text-amber-400 border-amber-500/50'
                                }`}
                              >
                                {site.priorityLevel}
                              </span>
                              {onSelectSite && (
                                <button
                                  onClick={() => {
                                    onSelectSite(site.siteCode);
                                    onClose();
                                  }}
                                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 ml-1"
                                >
                                  Inspect on Map &rarr;
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-2">
                            <span>Primary: <strong className="text-slate-300">{site.primaryTech}</strong></span>
                            {site.backupTech && (
                              <span>&bull; Backup: <strong className="text-slate-300">{site.backupTech}</strong></span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                            <div>
                              <span className="font-semibold text-rose-400">Identified Failure: </span>
                              <span className="text-slate-300">{site.identifiedIssue}</span>
                            </div>
                            <div className="pt-1 border-t border-slate-800/80">
                              <span className="font-semibold text-sky-400">Prescribed Engineering Action: </span>
                              <span className="text-slate-300">{site.recommendedAction}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Technology Reliability Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    Transport Technology Reliability Matrix
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.technologyReliabilityBreakdown.map((tech) => (
                    <div
                      key={tech.technology}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white">{tech.technology}</span>
                          <span
                            className={`font-mono text-xs font-bold ${
                              tech.reliabilityScore >= 95
                                ? 'text-emerald-400'
                                : tech.reliabilityScore >= 80
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {tech.reliabilityScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full ${
                              tech.reliabilityScore >= 95
                                ? 'bg-emerald-500'
                                : tech.reliabilityScore >= 80
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${tech.reliabilityScore}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{tech.observation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Field Recommendations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    Weekly Field Dispatch &amp; Governance Directives
                  </h4>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  {report.weeklyFieldRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Tag */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Synthesized via: <strong className="text-slate-400">{report.modelUsed}</strong></span>
                </div>
                <div>Generated: {new Date(report.generatedAt).toLocaleTimeString()}</div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate Report</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={loading || !report}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Executive Brief</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all shadow-md shadow-sky-500/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
