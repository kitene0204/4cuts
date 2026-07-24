import React from 'react';
import { Camera, Clock, Grid, LayoutList, Sparkles, SlidersHorizontal, Check, ArrowRight, RotateCcw } from 'lucide-react';
import { FrameType, PhotoFilter } from '../types';
import { PHOTO_FILTERS } from '../constants';

interface SetupScreenProps {
  layout: FrameType;
  onChangeLayout: (layout: FrameType) => void;
  countdown: number; // 3, 5, 7, 10
  onChangeCountdown: (sec: number) => void;
  filter: PhotoFilter;
  onChangeFilter: (filter: PhotoFilter) => void;
  isMirror: boolean;
  onToggleMirror: () => void;
  hasExistingShots?: boolean;
  onContinueToSelection?: () => void;
  onStartShooting: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  layout,
  onChangeLayout,
  countdown,
  onChangeCountdown,
  filter,
  onChangeFilter,
  isMirror,
  onToggleMirror,
  hasExistingShots = false,
  onContinueToSelection,
  onStartShooting,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {/* Intro Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>나만의 특별한 인생네컷 만들기</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          인생네컷 촬영 준비하기
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          원하는 프레임 양식과 카운트다운 시간을 고른 후 촬영을 시작해보세요!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Layout Selection */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-pink-400 font-bold text-lg">
            <Grid className="w-5 h-5" />
            <h3>1. 인생네컷 프레임 양식</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            가장 선호하는 인생네컷 배치 스타일을 선택하세요.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* 1x4 Vertical */}
            <button
              onClick={() => onChangeLayout('1x4')}
              className={`group relative p-4 rounded-xl border-2 transition-all text-left flex flex-col items-center gap-3 ${
                layout === '1x4'
                  ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
              }`}
            >
              {layout === '1x4' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              {/* Graphic representation */}
              <div className="w-16 h-28 bg-slate-800 border-2 border-slate-600 rounded-md p-1.5 flex flex-col gap-1 shadow-md">
                <div className="w-full flex-1 bg-slate-700 rounded-sm"></div>
                <div className="w-full flex-1 bg-slate-700 rounded-sm"></div>
                <div className="w-full flex-1 bg-slate-700 rounded-sm"></div>
                <div className="w-full flex-1 bg-slate-700 rounded-sm"></div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-1 justify-center">
                  <LayoutList className="w-3.5 h-3.5 text-pink-400" />
                  <span>1 × 4 세로 스트립</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">클래식한 4컷 포토 스트립</div>
              </div>
            </button>

            {/* 2x2 Grid */}
            <button
              onClick={() => onChangeLayout('2x2')}
              className={`group relative p-4 rounded-xl border-2 transition-all text-left flex flex-col items-center gap-3 ${
                layout === '2x2'
                  ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
              }`}
            >
              {layout === '2x2' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              {/* Graphic representation */}
              <div className="w-24 h-24 bg-slate-800 border-2 border-slate-600 rounded-md p-1.5 grid grid-cols-2 gap-1 shadow-md">
                <div className="w-full h-full bg-slate-700 rounded-sm"></div>
                <div className="w-full h-full bg-slate-700 rounded-sm"></div>
                <div className="w-full h-full bg-slate-700 rounded-sm"></div>
                <div className="w-full h-full bg-slate-700 rounded-sm"></div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-1 justify-center">
                  <Grid className="w-3.5 h-3.5 text-pink-400" />
                  <span>2 × 2 그리드</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">넓고 시원한 4분할 정사각형</div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Shooting Options */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-lg">
              <Clock className="w-5 h-5" />
              <h3>2. 카운트다운 타이머 설정</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              컷 촬영 사이 준비 시간을 설정하세요.
            </p>

            {/* Countdown Seconds options */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[3, 5, 7, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onChangeCountdown(sec)}
                  className={`py-3 px-2 rounded-xl font-bold text-sm border transition-all ${
                    countdown === sec
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {sec}초
                </button>
              ))}
            </div>

            {/* Additional Camera Options */}
            <div className="space-y-4 pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">좌우 반전 (거울 모드)</span>
                <button
                  onClick={onToggleMirror}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    isMirror ? 'bg-pink-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isMirror ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  기본 필터 미리보기
                </label>
                <select
                  value={filter}
                  onChange={(e) => onChangeFilter(e.target.value as PhotoFilter)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                >
                  {PHOTO_FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/50 p-3 rounded-xl border border-slate-700/40">
            <SlidersHorizontal className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <span>총 <b>6장</b>을 찍은 후 마음에 드는 <b>4장</b>을 골라 꾸미게 됩니다.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center space-y-4">
        {hasExistingShots && onContinueToSelection ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={onContinueToSelection}
              className="w-full sm:w-auto flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>기존 사진으로 [{layout === '1x4' ? '1×4 세로' : '2×2 그리드'}] 계속하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onStartShooting}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm sm:text-base rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>새로 촬영하기</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onStartShooting}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-lg sm:text-xl rounded-2xl shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            <Camera className="w-6 h-6 animate-pulse" />
            <span>촬영 시작하기</span>
          </button>
        )}
      </div>
    </div>
  );
};
