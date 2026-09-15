import React from 'react';
import { Film, Zap } from 'lucide-react';

interface Props {
  currentStep: number;
}

const STEPS = [
  { id: 1, label: 'Characters', desc: 'Upload character boards' },
  { id: 2, label: 'Script', desc: 'Write your screenplay' },
  { id: 3, label: 'Generate', desc: 'AI renders your 4K video' },
];

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center gap-0 w-full max-w-2xl mx-auto mb-10">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                transition-all duration-300 border-2
                ${isCompleted
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                  : isActive
                    ? 'bg-gold border-amber-400 text-slate-900 shadow-lg shadow-amber-400/40 animate-pulse-slow'
                    : 'bg-slate-800 border-slate-600 text-slate-400'}
              `}
                style={{ background: isActive ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : undefined }}
              >
                {isCompleted ? <Zap size={20} /> : isActive ? <Film size={20} /> : step.id}
              </div>
              <div className={`mt-2 text-center transition-colors ${isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className="text-sm font-semibold">{step.label}</div>
                <div className="text-xs opacity-70 hidden sm:block">{step.desc}</div>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-shrink-0 h-0.5 w-12 sm:w-20 mt-[-20px] transition-colors duration-500 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
