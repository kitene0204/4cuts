import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, RotateCcw, Camera, RefreshCw, LayoutList, Grid, Settings } from 'lucide-react';
import { Shot, FrameType } from '../types';

interface SelectPhotosScreenProps {
  shots: Shot[];
  layout: FrameType;
  selectedShots: Shot[]; // array of 4 chosen shots
  onChangeLayout?: (layout: FrameType) => void;
  onGoToSetup?: () => void;
  onConfirmSelection: (selected: Shot[]) => void;
  onRetakeAll: () => void;
  onRetakeSpecific: (indices: number[]) => void;
}

export const SelectPhotosScreen: React.FC<SelectPhotosScreenProps> = ({
  shots,
  layout,
  selectedShots: initialSelected,
  onChangeLayout,
  onGoToSetup,
  onConfirmSelection,
  onRetakeAll,
  onRetakeSpecific,
}) => {
  // Store up to 4 chosen shots in order
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelected.length === 4) {
      return initialSelected.map((s) => s.id);
    }
    // Default pick first 4
    return shots.slice(0, 4).map((s) => s.id);
  });

  // Indices selected for specific re-shooting (0-5)
  const [markedForRetake, setMarkedForRetake] = useState<number[]>([]);

  const toggleSelectShot = (shotId: string) => {
    if (selectedIds.includes(shotId)) {
      // Remove from selection
      setSelectedIds(selectedIds.filter((id) => id !== shotId));
    } else {
      // Add if under 4
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, shotId]);
      } else {
        // Replace last chosen slot
        setSelectedIds([...selectedIds.slice(0, 3), shotId]);
      }
    }
  };

  const toggleMarkForRetake = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (markedForRetake.includes(idx)) {
      setMarkedForRetake(markedForRetake.filter((i) => i !== idx));
    } else {
      setMarkedForRetake([...markedForRetake, idx].sort((a, b) => a - b));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length < 4) return;
    const chosen = selectedIds
      .map((id) => shots.find((s) => s.id === id))
      .filter((s): s is Shot => s !== undefined);
    onConfirmSelection(chosen);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {/* Title & Layout Controls */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>6장의 사진 중 4장을 골라주세요</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          인생네컷 사진 선택 및 재촬영
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          마음에 들지 않는 컷은 <span className="text-pink-400 font-bold">'이 컷 재촬영'</span>을 누르거나 선택해서 다시 찍으실 수 있습니다!
        </p>

        {/* Layout Switcher & Settings shortcut */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {onChangeLayout && (
            <div className="inline-flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-md">
              <button
                type="button"
                onClick={() => onChangeLayout('1x4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layout === '1x4'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>1 × 4 세로 프레임</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLayout('2x2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layout === '2x2'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2 × 2 그리드 프레임</span>
              </button>
            </div>
          )}

          {onGoToSetup && (
            <button
              type="button"
              onClick={onGoToSetup}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>촬영 설정 변경</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of 6 Shot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {shots.map((shot, idx) => {
          const selectIndex = selectedIds.indexOf(shot.id);
          const isSelected = selectIndex !== -1;
          const isMarked = markedForRetake.includes(idx);

          return (
            <div
              key={shot.id}
              onClick={() => toggleSelectShot(shot.id)}
              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border-4 cursor-pointer transition-all ${
                isMarked
                  ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                  : isSelected
                  ? 'border-pink-500 shadow-xl shadow-pink-500/20 scale-[1.02]'
                  : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
              }`}
            >
              <img
                src={shot.dataUrl}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Top Bar on Card: Selection Badge + Retake Checkbox */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                {/* Shot Label */}
                <div className="bg-slate-950/80 backdrop-blur-md text-[11px] text-slate-200 px-2 py-0.5 rounded-md font-bold border border-slate-700/60">
                  컷 #{idx + 1}
                </div>

                {/* Selection Badge */}
                <div>
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-extrabold text-xs flex items-center justify-center shadow-lg border-2 border-white">
                      {selectIndex + 1}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-900/80 border-2 border-slate-600 text-slate-400 font-bold text-xs flex items-center justify-center group-hover:border-slate-400">
                      +
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Action: Retake This Shot */}
              <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetakeSpecific([idx]);
                  }}
                  className="px-2.5 py-1 bg-slate-950/90 hover:bg-pink-600 text-pink-300 hover:text-white text-[11px] font-bold rounded-lg border border-pink-500/40 hover:border-pink-500 transition-all flex items-center gap-1 shadow-lg backdrop-blur-sm"
                  title="이 컷만 다시 촬영"
                >
                  <Camera className="w-3 h-3" />
                  <span>이 컷 재촬영</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => toggleMarkForRetake(idx, e)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    isMarked
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-amber-300'
                  }`}
                  title="다중 재촬영용 선택"
                >
                  {isMarked ? '✓ 선택됨' : '선택'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retake Bar when specific cuts marked */}
      {markedForRetake.length > 0 && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
          <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              선택한 컷: <strong className="text-white">{markedForRetake.map((i) => `컷 #${i + 1}`).join(', ')}</strong> ({markedForRetake.length}개)
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMarkedForRetake([])}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              선택 취소
            </button>
            <button
              onClick={() => onRetakeSpecific(markedForRetake)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>선택한 {markedForRetake.length}개 컷 다시 촬영하기</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Strip of the 4 Chosen Photos */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-8">
        <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider text-center">
          배치 미리보기 ({layout === '1x4' ? '1x4 세로' : '2x2 그리드'})
        </h4>

        <div
          className={`mx-auto max-w-xs bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-2 ${
            layout === '1x4' ? 'flex-col' : 'grid grid-cols-2'
          }`}
        >
          {Array.from({ length: 4 }).map((_, i) => {
            const shotId = selectedIds[i];
            const shot = shots.find((s) => s.id === shotId);

            return (
              <div
                key={i}
                className="aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center relative"
              >
                {shot ? (
                  <img src={shot.dataUrl} alt={`Slot ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-600 font-bold">슬롯 {i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onRetakeAll}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>전체 다시 촬영하기</span>
        </button>

        <button
          disabled={selectedIds.length < 4}
          onClick={handleConfirm}
          className={`w-full sm:w-auto px-10 py-3.5 font-extrabold text-base rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 ${
            selectedIds.length === 4
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25 hover:scale-105 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <span>선택 완료 & 꾸미기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
