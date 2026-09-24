import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, Radio, Zap, ShieldCheck, Truck } from 'lucide-react';

export interface GuidedDemoBarProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToStep: (step: number) => void;
}

export const TOUR_STEPS = [
  {
    step: 1,
    title: 'Macro Intelligence & Converged Topology',
    badge: 'Step 1 of 4',
    icon: Radio,
    speakerScript:
      'Introduce the Cloudflare Radar live national pulse for Zambia, followed by the full-width map showing DWDM Fibre, Microwave, and Satellite backhaul routes.',
    actionCue: 'Show the map & Cloudflare 24H/7D toggle',
  },
  {
    step: 2,
    title: 'Simulate Terrestrial Cut & Satellite Failover',
    badge: 'Step 2 of 4',
    icon: Zap,
    speakerScript:
      'Click "⚡ Simulate Link Cut" on Livingstone (ZM-005). Watch the primary line turn red and the OneWeb satellite arc illuminate purple in sub-second failover.',
    actionCue: 'Click "⚡ Simulate Link Cut" in Site Inspector',
  },
  {
    step: 3,
    title: 'AIOps Root-Cause & Sub-Second Audit Trail',
    badge: 'Step 3 of 4',
    icon: Sparkles,
    speakerScript:
      'Examine the 5-event Incident Timeline (T+0s to T+32s) and click "Run Diagnostic" to generate an official telecom incident draft with 95% AI confidence.',
    actionCue: 'Review timeline & click "Run Diagnostic"',
  },
  {
    step: 4,
    title: 'OSS 4x4 Dispatch & BSS SLA Revenue Protection',
    badge: 'Step 4 of 4',
    icon: Truck,
    speakerScript:
      'Click "Prepare Work Order" to inspect automated 4x4 LandCruiser dispatch with staged parts. Highlight Zambia Sugar\'s $16,800 MRR protected from SLA penalties.',
    actionCue: 'Click "Prepare Work Order" & review BSS MRR',
  },
];

export const GuidedDemoBar: React.FC<GuidedDemoBarProps> = ({
  isOpen,
  onClose,
  currentStep,
  onNextStep,
  onPrevStep,
  onJumpToStep,
}) => {
  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStep - 1] || TOUR_STEPS[0];
  const StepIcon = current.icon;
  const isFirst = currentStep === 1;
  const isLast = currentStep === TOUR_STEPS.length;

  return (
    <aside aria-label="Guided Pitch Tour" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/10 p-4 md:p-5 text-slate-100 animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Step Header & Speaker Script */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {current.badge}
            </span>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <StepIcon className="w-4 h-4 text-amber-400" />
              {current.title}
            </h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300 font-semibold">Pitch Script:</strong> {current.speakerScript}
          </p>

          <div className="text-[11px] text-sky-400 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Live Action: {current.actionCue}</span>
          </div>
        </div>

        {/* Right Side: Step Navigation Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <button
            onClick={onPrevStep}
            disabled={isFirst}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Pitch Step"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 px-2">
            {TOUR_STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => onJumpToStep(s.step)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s.step === currentStep
                    ? 'w-6 bg-amber-400 ring-2 ring-amber-400/30'
                    : s.step < currentStep
                    ? 'bg-emerald-400'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish Tour</span>
            </button>
          ) : (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-colors ml-1"
            title="Exit Guided Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
