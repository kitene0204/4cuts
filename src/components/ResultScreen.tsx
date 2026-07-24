import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Download, Film, Sparkles, RotateCcw, Edit3, CheckCircle2, Play, Pause, Loader2, LayoutGrid, Settings } from 'lucide-react';
import {
  Shot,
  FrameType,
  FrameColor,
  PhotoFilter,
  StickerItem,
  DrawingPath,
  VideoRecordFrame,
} from '../types';
import { renderFrameToCanvas } from '../utils/canvasRenderer';
import { generateTimelapseVideo } from '../utils/videoExporter';
import { playSuccessFanfare } from '../utils/audio';

interface VideoPreviewPlayerProps {
  frames: VideoRecordFrame[];
  speed: number;
}

const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ frames, speed }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    let diff = 120;
    const nextIndex = (currentFrameIndex + 1) % frames.length;
    if (frames[currentFrameIndex] && frames[nextIndex]) {
      const timeDiff = frames[nextIndex].timestamp - frames[currentFrameIndex].timestamp;
      if (timeDiff > 0 && timeDiff < 1000) {
        diff = timeDiff;
      }
    }

    const delay = Math.max(20, Math.round(diff / speed));

    const timer = setTimeout(() => {
      setCurrentFrameIndex(nextIndex);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentFrameIndex, speed, frames]);

  if (frames.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-slate-900 rounded-xl border border-slate-700/60 flex items-center justify-center text-slate-500 text-xs font-medium">
        녹화된 촬영 영상 프레임이 없습니다.
      </div>
    );
  }

  const currentFrame = frames[currentFrameIndex];
  const progressPercent = Math.round(((currentFrameIndex + 1) / frames.length) * 100);

  return (
    <div className="relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-700/80 shadow-md my-3">
      {/* Video Frame Display */}
      <div className="relative aspect-[4/3] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        {currentFrame ? (
          <img
            src={currentFrame.dataUrl}
            alt={`Preview frame ${currentFrameIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Live Speed Badge */}
        <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/80 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[11px] font-bold text-amber-300">
            타임랩스 미리보기 ({speed}배속)
          </span>
        </div>

        {/* Center Play/Pause Quick Overlay */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-600 text-amber-300 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </div>
        </button>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 relative">
        <div
          className="bg-amber-400 h-full transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Control Bar */}
      <div className="px-3 py-2 bg-slate-900 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:bg-slate-800 rounded-md text-amber-400 hover:text-amber-300 transition-colors"
            title={isPlaying ? '일시정지' : '재생'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentFrameIndex(0);
              setIsPlaying(true);
            }}
            className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
            title="처음부터 재생"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            {currentFrameIndex + 1} / {frames.length} 프레임
          </span>
        </div>

        <span className="text-[11px] font-bold text-pink-400">
          {isPlaying ? '▶ 재생 중' : '⏸ 일시정지'}
        </span>
      </div>
    </div>
  );
};

interface ResultScreenProps {
  shots: Shot[]; // 4 selected photos
  layout: FrameType;
  frameColor: FrameColor;
  customHex: string;
  filter: PhotoFilter;
  stickers: StickerItem[];
  drawings: DrawingPath[];
  titleText: string;
  dateText: string;
  videoFrames: VideoRecordFrame[];
  onReEdit: () => void;
  onSelectPhotos?: () => void;
  onGoToSetup?: () => void;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  shots,
  layout,
  frameColor,
  customHex,
  filter,
  stickers,
  drawings,
  titleText,
  dateText,
  videoFrames,
  onReEdit,
  onSelectPhotos,
  onGoToSetup,
  onRestart,
}) => {
  const [renderedImageDataUrl, setRenderedImageDataUrl] = useState<string | null>(null);
  const [videoSpeed, setVideoSpeed] = useState<number>(1.5); // 1.0, 1.5, 2.0
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Render High-Res Canvas Image on Mount
  useEffect(() => {
    let isMounted = true;

    async function buildImage() {
      try {
        const photoUrls = shots.map((s) => s.dataUrl);
        const canvas = await renderFrameToCanvas({
          layout,
          photos: photoUrls,
          frameColor,
          customBgHex: customHex,
          filter,
          stickers,
          drawings,
          titleText,
          dateText,
          showDate: true,
        });

        if (isMounted) {
          setRenderedImageDataUrl(canvas.toDataURL('image/png'));
        }
      } catch (e) {
        console.error('Canvas render error:', e);
      }
    }

    buildImage();
    playSuccessFanfare();

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    return () => {
      isMounted = false;
    };
  }, [shots, layout, frameColor, customHex, filter, stickers, drawings, titleText, dateText]);

  // Handle Image Download
  const handleDownloadImage = () => {
    if (!renderedImageDataUrl) return;
    const a = document.createElement('a');
    a.href = renderedImageDataUrl;
    a.download = `lifefourcuts_${dateText.replace(/\./g, '') || 'photo'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle Video Download with Selected Playback Speed (1x, 1.5x, 2x)
  const handleDownloadVideo = async () => {
    if (videoFrames.length === 0) {
      alert('녹화된 촬영 영상이 없습니다.');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);

    try {
      const blob = await generateTimelapseVideo(videoFrames, videoSpeed, (p) => {
        setVideoProgress(p);
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifefourcuts_timelapse_${videoSpeed}x.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Video export error:', e);
      alert('동영상 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {/* Success Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>인생네컷이 완성되었습니다!</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          완성된 인생네컷 저장하기
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          이미지와 촬영 과정 동영상(배속 선택 가능)을 다운로드하실 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
        {/* Rendered Frame Preview */}
        <div className="flex flex-col items-center">
          {renderedImageDataUrl ? (
            <div className="relative group max-w-xs shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900">
              <img
                src={renderedImageDataUrl}
                alt="Final Life Four Cuts Frame"
                className="w-full h-auto block"
              />
            </div>
          ) : (
            <div className="w-64 h-96 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">고화질 렌더링 중...</span>
            </div>
          )}
        </div>

        {/* Download & Options Panel */}
        <div className="space-y-6">
          {/* Image Download Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span>1. 이미지 결과물 저장</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              고화질 PNG 파일로 선명하게 저장됩니다.
            </p>
            <button
              onClick={handleDownloadImage}
              disabled={!renderedImageDataUrl}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-base rounded-xl shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>이미지 다운로드</span>
            </button>
          </div>

          {/* Video Download Card with Speed Selector */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>2. 촬영 과정 동영상 저장</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              원하는 재생 배속을 선택한 후 타임랩스 비디오로 저장하세요!
            </p>

            {/* Speed Selector Tabs (1x, 1.5x, 2x, 3x, 4x) */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                동영상 배속 선택
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                {[
                  { speed: 1.0, label: '1배속' },
                  { speed: 1.5, label: '1.5배속' },
                  { speed: 2.0, label: '2배속' },
                  { speed: 3.0, label: '3배속' },
                  { speed: 4.0, label: '4배속' },
                ].map((item) => (
                  <button
                    key={item.speed}
                    onClick={() => setVideoSpeed(item.speed)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      videoSpeed === item.speed
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Live Preview Player */}
            <VideoPreviewPlayer frames={videoFrames} speed={videoSpeed} />

            {/* Video Export Progress */}
            {isGeneratingVideo && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-amber-300 mb-1 font-bold">
                  <span>동영상 인코딩 중...</span>
                  <span>{videoProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-150"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleDownloadVideo}
              disabled={isGeneratingVideo}
              className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingVideo ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Film className="w-5 h-5" />
              )}
              <span>동영상 다운로드 ({videoSpeed}배속)</span>
            </button>
          </div>

          {/* Action Secondary Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
            {onGoToSetup && (
              <button
                onClick={onGoToSetup}
                className="flex-1 py-3 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">촬영 설정 변경</span>
              </button>
            )}

            {onSelectPhotos && (
              <button
                onClick={onSelectPhotos}
                className="flex-1 py-3 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <LayoutGrid className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="whitespace-nowrap">사진 다시 선택</span>
              </button>
            )}

            <button
              onClick={onReEdit}
              className="flex-1 py-3 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="whitespace-nowrap">다시 꾸미기</span>
            </button>

            <button
              onClick={onRestart}
              className="flex-1 py-3 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">새로 촬영하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
