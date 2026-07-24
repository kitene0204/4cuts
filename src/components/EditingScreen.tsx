import React, { useState } from 'react';
import {
  Palette,
  Smile,
  PenTool,
  Sparkles,
  Trash2,
  Undo2,
  Type,
  Check,
  RotateCw,
  Maximize2,
  Sliders,
  ArrowRight,
  Layers,
  LayoutList,
  Grid,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Shot,
  FrameType,
  FrameColor,
  PhotoFilter,
  StickerItem,
  DrawingPath,
} from '../types';
import {
  FRAME_COLORS,
  PHOTO_FILTERS,
  STICKER_PRESETS,
  DRAWING_COLORS,
} from '../constants';
import { DrawingCanvas } from './DrawingCanvas';

interface EditingScreenProps {
  shots: Shot[]; // 4 selected photos
  layout: FrameType;
  onChangeLayout?: (layout: FrameType) => void;
  frameColor: FrameColor;
  onChangeFrameColor: (color: FrameColor) => void;
  customHex: string;
  onChangeCustomHex: (hex: string) => void;
  filter: PhotoFilter;
  onChangeFilter: (filter: PhotoFilter) => void;
  stickers: StickerItem[];
  onAddSticker: (sticker: StickerItem) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onRemoveSticker: (id: string) => void;
  drawings: DrawingPath[];
  onAddDrawingPath: (path: DrawingPath) => void;
  onClearDrawings: (photoIndex: number | 'frame') => void;
  titleText: string;
  onChangeTitleText: (text: string) => void;
  dateText: string;
  onChangeDateText: (text: string) => void;
  onSelectPhotos?: () => void;
  onCompleteEditing: () => void;
}

export const EditingScreen: React.FC<EditingScreenProps> = ({
  shots,
  layout,
  onChangeLayout,
  frameColor,
  onChangeFrameColor,
  customHex,
  onChangeCustomHex,
  filter,
  onChangeFilter,
  stickers,
  onAddSticker,
  onUpdateSticker,
  onRemoveSticker,
  drawings,
  onAddDrawingPath,
  onClearDrawings,
  titleText,
  onChangeTitleText,
  dateText,
  onChangeDateText,
  onSelectPhotos,
  onCompleteEditing,
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'stickers' | 'draw' | 'filter' | 'text'>('color');
  const [activePhotoTarget, setActivePhotoTarget] = useState<number | 'frame'>('frame');

  // Drawing state
  const [drawTool, setDrawTool] = useState<'pen' | 'neon' | 'eraser'>('pen');
  const [drawColor, setDrawColor] = useState<string>('#FF3B30');
  const [drawSize, setDrawSize] = useState<number>(6);

  // Selected Sticker for interaction
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const filterOption = PHOTO_FILTERS.find((f) => f.id === filter) || PHOTO_FILTERS[0];

  const handleAddSticker = (preset: (typeof STICKER_PRESETS)[0]) => {
    const newSticker: StickerItem = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      photoIndex: activePhotoTarget,
      content: preset.content,
      type: preset.type as 'emoji' | 'prop' | 'text',
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    onAddSticker(newSticker);
    setSelectedStickerId(newSticker.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-white min-h-[calc(100vh-80px)] flex flex-col justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Main Frame Live Preview Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs bg-slate-800 text-pink-300 font-bold px-3 py-1.5 rounded-full border border-slate-700 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>사진을 클릭하여 개별 스티커/그리기를 작업할 수 있습니다</span>
            </span>

            {onChangeLayout && (
              <div className="inline-flex items-center bg-slate-800 p-1 rounded-full border border-slate-700 shadow-sm">
                <button
                  type="button"
                  onClick={() => onChangeLayout('1x4')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                    layout === '1x4'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutList className="w-3 h-3" />
                  <span>1×4 세로</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLayout('2x2')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                    layout === '2x2'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  <span>2×2 그리드</span>
                </button>
              </div>
            )}

            {onSelectPhotos && (
              <button
                onClick={onSelectPhotos}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-full border border-slate-700 hover:border-pink-500/50 inline-flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>사진 선택 다시하기 / 컷 재촬영</span>
              </button>
            )}
          </div>

          {/* Interactive Frame Wrapper */}
          <div
            className={`relative p-5 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
              frameColor.borderStyle || 'border border-slate-700'
            }`}
            style={{
              background: customHex || frameColor.hex,
              color: frameColor.textColor,
              width: layout === '1x4' ? '280px' : '420px',
            }}
          >
            {/* Target Selector Banner */}
            <div className="mb-3 flex items-center justify-between text-[11px] font-bold opacity-80 px-1">
              <span>작업 대상: {activePhotoTarget === 'frame' ? '전체 프레임' : `사진 #${(activePhotoTarget as number) + 1}`}</span>
              <button
                onClick={() => setActivePhotoTarget('frame')}
                className="underline hover:opacity-100"
              >
                전체 선택
              </button>
            </div>

            {/* Photos Grid Container */}
            <div
              className={`gap-3 relative ${
                layout === '1x4' ? 'flex flex-col' : 'grid grid-cols-2'
              }`}
            >
              {shots.map((shot, idx) => {
                const isTarget = activePhotoTarget === idx;

                return (
                  <div
                    key={shot.id}
                    onClick={() => setActivePhotoTarget(idx)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 group cursor-pointer transition-all border-2 ${
                      isTarget ? 'border-pink-500 ring-2 ring-pink-500/50 shadow-lg' : 'border-black/10 hover:border-pink-400/50'
                    }`}
                  >
                    {/* Base Photo Image */}
                    <img
                      src={shot.dataUrl}
                      alt={`Cut ${idx + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{ filter: filterOption.cssFilter }}
                    />

                    {/* Individual Drawing Canvas Layer */}
                    <DrawingCanvas
                      paths={drawings}
                      onAddPath={onAddDrawingPath}
                      onClearPaths={() => onClearDrawings(idx)}
                      tool={drawTool}
                      color={drawColor}
                      size={drawSize}
                      photoIndex={idx}
                      disabled={activeTab !== 'draw' || activePhotoTarget !== idx}
                    />

                    {/* Stickers Layer for this Photo */}
                    {stickers
                      .filter((s) => s.photoIndex === idx)
                      .map((sticker) => {
                        const isSelected = selectedStickerId === sticker.id;

                        return (
                          <div
                            key={sticker.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStickerId(sticker.id);
                            }}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none transition-transform ${
                              isSelected ? 'ring-2 ring-pink-400 p-1 rounded-md bg-black/20' : ''
                            }`}
                            style={{
                              left: `${sticker.x}%`,
                              top: `${sticker.y}%`,
                              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                            }}
                          >
                            <span className="text-4xl block leading-none">{sticker.content}</span>

                            {/* Sticker Controls when selected */}
                            {isSelected && (
                              <div className="absolute -top-7 -right-7 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-full p-1 shadow-lg z-30">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateSticker(sticker.id, {
                                      rotation: (sticker.rotation + 15) % 360,
                                    });
                                  }}
                                  className="p-1 hover:bg-slate-800 text-slate-200 rounded-full"
                                  title="회전"
                                >
                                  <RotateCw className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateSticker(sticker.id, {
                                      scale: Math.min(2.5, sticker.scale + 0.2),
                                    });
                                  }}
                                  className="p-1 hover:bg-slate-800 text-slate-200 rounded-full"
                                  title="확대"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveSticker(sticker.id);
                                    setSelectedStickerId(null);
                                  }}
                                  className="p-1 hover:bg-rose-900 text-rose-300 rounded-full"
                                  title="삭제"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>

            {/* Frame-Level Drawing Canvas Layer */}
            <DrawingCanvas
              paths={drawings}
              onAddPath={onAddDrawingPath}
              onClearPaths={() => onClearDrawings('frame')}
              tool={drawTool}
              color={drawColor}
              size={drawSize}
              photoIndex="frame"
              disabled={activeTab !== 'draw' || activePhotoTarget !== 'frame'}
            />

            {/* Frame-Level Stickers Layer */}
            {stickers
              .filter((s) => s.photoIndex === 'frame')
              .map((sticker) => {
                const isSelected = selectedStickerId === sticker.id;

                return (
                  <div
                    key={sticker.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStickerId(sticker.id);
                    }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none transition-transform z-30 ${
                      isSelected ? 'ring-2 ring-pink-400 p-1 rounded-md bg-black/20' : ''
                    }`}
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                    }}
                  >
                    <span className="text-4xl block leading-none">{sticker.content}</span>

                    {isSelected && (
                      <div className="absolute -top-7 -right-7 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-full p-1 shadow-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSticker(sticker.id, {
                              rotation: (sticker.rotation + 15) % 360,
                            });
                          }}
                          className="p-1 hover:bg-slate-800 text-slate-200 rounded-full"
                          title="회전"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSticker(sticker.id, {
                              scale: Math.min(2.5, sticker.scale + 0.2),
                            });
                          }}
                          className="p-1 hover:bg-slate-800 text-slate-200 rounded-full"
                          title="확대"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSticker(sticker.id);
                            setSelectedStickerId(null);
                          }}
                          className="p-1 hover:bg-rose-900 text-rose-300 rounded-full"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Frame Brand Watermark Header/Footer */}
            <div className="mt-5 text-center">
              <div className="font-bold text-base tracking-widest uppercase">
                {titleText || 'LIFE FOUR CUTS'}
              </div>
              <div className="text-[11px] font-medium opacity-80 mt-0.5">{dateText}</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tool Control Panels */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-xl">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-700 mb-6">
            <button
              onClick={() => setActiveTab('color')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeTab === 'color'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>프레임색</span>
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeTab === 'stickers'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>스티커</span>
            </button>

            <button
              onClick={() => setActiveTab('draw')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeTab === 'draw'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>직접그리기</span>
            </button>

            <button
              onClick={() => setActiveTab('filter')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeTab === 'filter'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>필터</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeTab === 'text'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>문구/날짜</span>
            </button>
          </div>

          {/* TAB 1: FRAME COLOR PALETTE */}
          {activeTab === 'color' && (
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <span>프레임 배경 색상 선택</span>
              </h4>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {FRAME_COLORS.map((c) => {
                  const isSelected = frameColor.id === c.id && !customHex;

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onChangeCustomHex('');
                        onChangeFrameColor(c);
                      }}
                      className={`group relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-pink-500 bg-slate-900'
                          : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-slate-600 shadow-inner flex items-center justify-center"
                        style={{ background: c.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-pink-500 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-medium text-slate-300 truncate w-full text-center">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="pt-3 border-t border-slate-700/60">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  커스텀 색상 직접 입력
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customHex || frameColor.hex}
                    onChange={(e) => onChangeCustomHex(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={customHex || frameColor.hex}
                    onChange={(e) => onChangeCustomHex(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STICKERS */}
          {activeTab === 'stickers' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-pink-400" />
                  <span>스티커 추가</span>
                </h4>
                <div className="text-xs text-slate-400">
                  대상: <span className="text-pink-300 font-bold">{activePhotoTarget === 'frame' ? '전체 프레임' : `사진 #${(activePhotoTarget as number) + 1}`}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1 pr-2">
                {STICKER_PRESETS.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleAddSticker(sticker)}
                    className="p-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
                  >
                    {sticker.content}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 mt-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                💡 스티커를 터치/클릭하면 회전, 크기 조절, 삭제를 수행할 수 있습니다.
              </p>
            </div>
          )}

          {/* TAB 3: DIRECT HAND DRAWING */}
          {activeTab === 'draw' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-pink-400" />
                  <span>터치/마우스 그리기</span>
                </h4>
                <button
                  onClick={() => onClearDrawings(activePhotoTarget)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>모두 지우기</span>
                </button>
              </div>

              {/* Tool selector */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setDrawTool('pen')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    drawTool === 'pen'
                      ? 'bg-pink-500 text-white border-pink-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  일반 펜
                </button>
                <button
                  onClick={() => setDrawTool('neon')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    drawTool === 'neon'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  네온 펜
                </button>
                <button
                  onClick={() => setDrawTool('eraser')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    drawTool === 'eraser'
                      ? 'bg-slate-700 text-white border-slate-500'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  지우개
                </button>
              </div>

              {/* Color Swatches */}
              {drawTool !== 'eraser' && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">펜 색상</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {DRAWING_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setDrawColor(c.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          drawColor === c.hex ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Thickness Slider */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                  <span>선 두께</span>
                  <span>{drawSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={drawSize}
                  onChange={(e) => setDrawSize(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FILTER PRESET */}
          {activeTab === 'filter' && (
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <span>사진 필터 스타일</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChangeFilter(f.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      filter === f.id
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-sm">{f.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TITLE & DATE TEXT */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-pink-400" />
                <span>프레임 제목 & 날짜</span>
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  메인 포토 문구
                </label>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => onChangeTitleText(e.target.value)}
                  placeholder="LIFE FOUR CUTS"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  날짜 표기
                </label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => onChangeDateText(e.target.value)}
                  placeholder="2026.07.24"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onCompleteEditing}
          className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-xl rounded-2xl shadow-xl shadow-pink-500/25 hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto"
        >
          <span>인생네컷 완성하기</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
