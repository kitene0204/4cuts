import React from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { Step } from '../types';

interface HeaderProps {
  currentStep: Step;
  hasShots?: boolean;
  hasSelection?: boolean;
  onNavigateStep?: (step: Step) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  hasShots = false,
  hasSelection = false,
  onNavigateStep,
  onReset,
}) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'setup', label: '1. 설정' },
    { key: 'shooting', label: '2. 촬영' },
    { key: 'selecting', label: '3. 사진선택' },
    { key: 'editing', label: '4. 꾸미기' },
    { key: 'result', label: '5. 완성' },
  ];

  const isStepClickable = (stepKey: Step) => {
    if (stepKey === currentStep) return false;
    if (stepKey === 'setup') return true;
    if (stepKey === 'shooting') return true;
    if (stepKey === 'selecting') return hasShots;
    if (stepKey === 'editing') return hasSelection;
    if (stepKey === 'result') return hasSelection;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-pink-300 via-purple-200 to-amber-200 bg-clip-text text-transparent">
              인생네컷 포토부스
            </h1>
            <p className="text-[10px] text-slate-400 -mt-1 font-medium">Life Four Cuts Studio</p>
          </div>
        </div>

        {/* Step Indicator */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.key;
            const clickable = isStepClickable(step.key);

            return (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  disabled={!clickable && !isActive}
                  onClick={() => clickable && onNavigateStep && onNavigateStep(step.key)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-pink-500 text-white font-semibold shadow-sm'
                      : clickable
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/80 cursor-pointer'
                      : 'text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  {step.label}
                </button>
                {idx < steps.length - 1 && <span className="text-slate-600 text-[10px]">›</span>}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentStep !== 'setup' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>처음으로</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
