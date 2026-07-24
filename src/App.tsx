import React, { useState } from 'react';
import {
  FrameType,
  Shot,
  Step,
  FrameColor,
  PhotoFilter,
  StickerItem,
  DrawingPath,
  VideoRecordFrame,
} from './types';
import { FRAME_COLORS } from './constants';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { ShootingScreen } from './components/ShootingScreen';
import { SelectPhotosScreen } from './components/SelectPhotosScreen';
import { EditingScreen } from './components/EditingScreen';
import { ResultScreen } from './components/ResultScreen';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('setup');

  // Setup Options
  const [layout, setLayout] = useState<FrameType>('1x4');
  const [countdown, setCountdown] = useState<number>(3);
  const [filter, setFilter] = useState<PhotoFilter>('none');
  const [isMirror, setIsMirror] = useState<boolean>(true);

  // Shooting Data
  const [allShots, setAllShots] = useState<Shot[]>([]);
  const [selectedShots, setSelectedShots] = useState<Shot[]>([]);
  const [videoFrames, setVideoFrames] = useState<VideoRecordFrame[]>([]);
  const [retakeIndices, setRetakeIndices] = useState<number[] | null>(null);

  // Editing Options
  const [frameColor, setFrameColor] = useState<FrameColor>(FRAME_COLORS[0]); // Default Black
  const [customHex, setCustomHex] = useState<string>('');
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const [titleText, setTitleText] = useState<string>('LIFE FOUR CUTS');
  const [dateText, setDateText] = useState<string>(todayStr);

  // Handlers
  const handleStartShooting = () => {
    setAllShots([]);
    setSelectedShots([]);
    setVideoFrames([]);
    setStickers([]);
    setDrawings([]);
    setRetakeIndices(null);
    setCurrentStep('shooting');
  };

  const handleRetakeSpecific = (indices: number[]) => {
    setRetakeIndices(indices);
    setCurrentStep('shooting');
  };

  const handleFinishShooting = (shots: Shot[], recordedVideoFrames: VideoRecordFrame[]) => {
    setAllShots(shots);
    setVideoFrames(recordedVideoFrames);

    // If selectedShots was already populated, update items matching replaced indices
    if (selectedShots.length === 4 && allShots.length === 6 && shots.length === 6) {
      const updatedSelected = selectedShots.map((oldShot) => {
        const oldIdx = allShots.findIndex((s) => s.id === oldShot.id);
        if (oldIdx !== -1 && shots[oldIdx]) {
          return shots[oldIdx];
        }
        return oldShot;
      });
      setSelectedShots(updatedSelected);
    } else {
      setSelectedShots(shots.slice(0, 4)); // Default top 4
    }

    setRetakeIndices(null);
    setCurrentStep('selecting');
  };

  const handleConfirmPhotoSelection = (chosen: Shot[]) => {
    setSelectedShots(chosen);
    setCurrentStep('editing');
  };

  const handleReset = () => {
    if (currentStep !== 'setup') {
      if (confirm('처음으로 돌아가시겠습니까? 진행 중인 촬영 및 작성 데이터가 초기화됩니다.')) {
        setCurrentStep('setup');
      }
    }
  };

  // Sticker operations
  const handleAddSticker = (sticker: StickerItem) => {
    setStickers((prev) => [...prev, sticker]);
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  // Drawing operations
  const handleAddDrawingPath = (path: DrawingPath) => {
    setDrawings((prev) => [...prev, path]);
  };

  const handleClearDrawings = (photoIndex: number | 'frame') => {
    setDrawings((prev) => prev.filter((d) => d.photoIndex !== photoIndex));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white flex flex-col">
      <Header
        currentStep={currentStep}
        hasShots={allShots.length > 0}
        hasSelection={selectedShots.length === 4}
        onNavigateStep={(step) => setCurrentStep(step)}
        onReset={handleReset}
      />

      <main className="flex-1 pb-12">
        {currentStep === 'setup' && (
          <SetupScreen
            layout={layout}
            onChangeLayout={setLayout}
            countdown={countdown}
            onChangeCountdown={setCountdown}
            filter={filter}
            onChangeFilter={setFilter}
            isMirror={isMirror}
            onToggleMirror={() => setIsMirror(!isMirror)}
            hasExistingShots={allShots.length > 0}
            onContinueToSelection={() => setCurrentStep('selecting')}
            onStartShooting={handleStartShooting}
          />
        )}

        {currentStep === 'shooting' && (
          <ShootingScreen
            countdownDuration={countdown}
            filter={filter}
            isMirror={isMirror}
            retakeIndices={retakeIndices}
            existingShots={allShots}
            onFinishShooting={handleFinishShooting}
            onCancel={() => {
              setRetakeIndices(null);
              if (allShots.length > 0) {
                setCurrentStep('selecting');
              } else {
                setCurrentStep('setup');
              }
            }}
          />
        )}

        {currentStep === 'selecting' && (
          <SelectPhotosScreen
            shots={allShots}
            layout={layout}
            selectedShots={selectedShots}
            onChangeLayout={setLayout}
            onGoToSetup={() => setCurrentStep('setup')}
            onConfirmSelection={handleConfirmPhotoSelection}
            onRetakeAll={handleStartShooting}
            onRetakeSpecific={handleRetakeSpecific}
          />
        )}

        {currentStep === 'editing' && (
          <EditingScreen
            shots={selectedShots}
            layout={layout}
            onChangeLayout={setLayout}
            frameColor={frameColor}
            onChangeFrameColor={setFrameColor}
            customHex={customHex}
            onChangeCustomHex={setCustomHex}
            filter={filter}
            onChangeFilter={setFilter}
            stickers={stickers}
            onAddSticker={handleAddSticker}
            onUpdateSticker={handleUpdateSticker}
            onRemoveSticker={handleRemoveSticker}
            drawings={drawings}
            onAddDrawingPath={handleAddDrawingPath}
            onClearDrawings={handleClearDrawings}
            titleText={titleText}
            onChangeTitleText={setTitleText}
            dateText={dateText}
            onChangeDateText={setDateText}
            onSelectPhotos={() => setCurrentStep('selecting')}
            onCompleteEditing={() => setCurrentStep('result')}
          />
        )}

        {currentStep === 'result' && (
          <ResultScreen
            shots={selectedShots}
            layout={layout}
            frameColor={frameColor}
            customHex={customHex}
            filter={filter}
            stickers={stickers}
            drawings={drawings}
            titleText={titleText}
            dateText={dateText}
            videoFrames={videoFrames}
            onReEdit={() => setCurrentStep('editing')}
            onSelectPhotos={() => setCurrentStep('selecting')}
            onGoToSetup={() => setCurrentStep('setup')}
            onRestart={() => setCurrentStep('setup')}
          />
        )}
      </main>
    </div>
  );
}
