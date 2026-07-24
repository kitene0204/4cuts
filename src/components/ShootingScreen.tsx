import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Volume2, Sparkles, AlertCircle, FlipHorizontal } from 'lucide-react';
import { Shot, PhotoFilter, VideoRecordFrame } from '../types';
import { PHOTO_FILTERS } from '../constants';
import { playCountdownBeep, playShutterSound } from '../utils/audio';

interface ShootingScreenProps {
  countdownDuration: number; // e.g. 3, 5, 7, 10
  filter: PhotoFilter;
  isMirror: boolean;
  retakeIndices?: number[] | null;
  existingShots?: Shot[];
  onFinishShooting: (shots: Shot[], videoFrames: VideoRecordFrame[]) => void;
  onCancel: () => void;
}

export const ShootingScreen: React.FC<ShootingScreenProps> = ({
  countdownDuration,
  filter,
  isMirror,
  retakeIndices,
  existingShots,
  onFinishShooting,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [useSimulation, setUseSimulation] = useState(false);

  // Retake mode setup
  const isRetake = Boolean(retakeIndices && retakeIndices.length > 0);
  const [retakeStep, setRetakeStep] = useState(0);

  const [currentShotIndex, setCurrentShotIndex] = useState(() => {
    if (retakeIndices && retakeIndices.length > 0) {
      return retakeIndices[0];
    }
    return 0;
  });

  const [countdown, setCountdown] = useState(countdownDuration);
  const [isCounting, setIsCounting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const shotsRef = useRef<Shot[]>(
    existingShots && existingShots.length === 6 ? [...existingShots] : []
  );
  const videoFramesRef = useRef<VideoRecordFrame[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  const filterOption = PHOTO_FILTERS.find((f) => f.id === filter) || PHOTO_FILTERS[0];

  // Initialize Camera
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 960 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) return;

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setHasCameraPermission(true);
      } catch (e) {
        console.warn('Camera access error:', e);
        if (isMounted) {
          setHasCameraPermission(false);
          setUseSimulation(true); // Fallback test mode
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    };
  }, []);

  // Frame Capture Function for Video Recording Stream
  const recordVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video && hasCameraPermission && !useSimulation && video.readyState >= 2) {
      ctx.save();
      if (isMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.filter = filterOption.cssFilter;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      // Simulation graphic canvas frame
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Life 4 Cuts Booth`, canvas.width / 2, canvas.height / 2 + 80);
      ctx.font = '20px sans-serif';
      ctx.fillText(`Shot #${currentShotIndex + 1} / 6`, canvas.width / 2, canvas.height / 2 + 120);
    }

    // Overlay current countdown overlay if counting
    if (isCounting) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${countdown}`, canvas.width / 2, canvas.height / 2);
    }

    videoFramesRef.current.push({
      dataUrl: canvas.toDataURL('image/jpeg', 0.6),
      timestamp: Date.now(),
    });
  }, [hasCameraPermission, useSimulation, isMirror, filterOption, isCounting, countdown, currentShotIndex]);

  // Start Video Recording Interval
  useEffect(() => {
    recordIntervalRef.current = window.setInterval(() => {
      recordVideoFrame();
    }, 120); // Capture frame every 120ms

    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [recordVideoFrame]);

  // Snapshot Capture Function
  const capturePhoto = useCallback(() => {
    playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const video = videoRef.current;
    if (video && hasCameraPermission && !useSimulation && video.readyState >= 2) {
      ctx.save();
      if (isMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.filter = filterOption.cssFilter;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      // Generated high quality stylized photo for test mode
      const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
      const bg = colors[currentShotIndex % colors.length];

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw fun test artwork
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 60, 160, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#111827';
      const eyeOffset = currentShotIndex % 2 === 0 ? 50 : 30;
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - eyeOffset, canvas.height / 2 - 80, 20, 0, Math.PI * 2);
      ctx.arc(canvas.width / 2 + eyeOffset, canvas.height / 2 - 80, 20, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#111827';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 50, 60, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Text watermark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`LIFE 4 CUTS • CUT #${currentShotIndex + 1}`, canvas.width / 2, canvas.height / 2 + 200);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const newShot: Shot = {
      id: `shot-${Date.now()}-${currentShotIndex}`,
      dataUrl,
      timestamp: Date.now(),
    };

    if (isRetake && retakeIndices && retakeIndices.length > 0) {
      shotsRef.current[currentShotIndex] = newShot;
      if (retakeStep + 1 < retakeIndices.length) {
        const nextStep = retakeStep + 1;
        setRetakeStep(nextStep);
        setCurrentShotIndex(retakeIndices[nextStep]);
        setCountdown(countdownDuration);
      } else {
        setIsCounting(false);
        setTimeout(() => {
          onFinishShooting(shotsRef.current, videoFramesRef.current);
        }, 500);
      }
    } else {
      shotsRef.current.push(newShot);
      if (currentShotIndex < 5) {
        // Prepare for next shot
        setCurrentShotIndex((prev) => prev + 1);
        setCountdown(countdownDuration);
      } else {
        // All 6 shots completed!
        setIsCounting(false);
        setTimeout(() => {
          onFinishShooting(shotsRef.current, videoFramesRef.current);
        }, 500);
      }
    }
  }, [
    hasCameraPermission,
    useSimulation,
    isMirror,
    filterOption,
    currentShotIndex,
    countdownDuration,
    onFinishShooting,
    isRetake,
    retakeIndices,
    retakeStep,
  ]);

  // Countdown Loop Effect
  useEffect(() => {
    let timer: number;

    if (isCounting) {
      if (countdown > 0) {
        playCountdownBeep(countdown === 1);
        timer = window.setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Countdown reached 0 -> Take photo!
        capturePhoto();
      }
    }

    return () => clearTimeout(timer);
  }, [isCounting, countdown, capturePhoto]);

  // Auto Start First Countdown
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsCounting(true);
    }, 1000);
    return () => clearTimeout(startDelay);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-white flex flex-col items-center">
      {/* Top Banner Stats */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold text-sm sm:text-base text-slate-100">
            {isRetake ? (
              <>
                선택 컷 재촬영 중: <span className="text-pink-400 font-extrabold">컷 #{currentShotIndex + 1}</span> ({retakeStep + 1} / {retakeIndices?.length})
              </>
            ) : (
              <>
                촬영 진행 중: <span className="text-pink-400 font-extrabold">{currentShotIndex + 1}</span> / 6
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseSimulation(!useSimulation)}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg border border-slate-600 font-medium"
          >
            {useSimulation ? '카메라 전환' : '시뮬레이션 모드'}
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            취소
          </button>
        </div>
      </div>

      {/* Main Viewfinder Stage */}
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-slate-950 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex items-center justify-center">
        {/* Flash Overlay */}
        <div
          className={`absolute inset-0 bg-white z-40 transition-opacity duration-150 pointer-events-none ${
            isFlashing ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Real Camera Stream */}
        {!useSimulation && (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-all ${
              isMirror ? 'scale-x-[-1]' : ''
            }`}
            style={{ filter: filterOption.cssFilter }}
          />
        )}

        {/* Fallback Simulation View */}
        {useSimulation && (
          <div className="w-full h-full bg-gradient-to-tr from-purple-900 via-slate-900 to-rose-950 flex flex-col items-center justify-center text-center p-6">
            <div className="w-32 h-32 rounded-full bg-pink-500/20 border-4 border-pink-400 flex items-center justify-center mb-4 shadow-xl shadow-pink-500/20 animate-pulse">
              <Camera className="w-16 h-16 text-pink-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">카메라 시뮬레이션 모드</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              카메라 권한이 없거나 미지원되는 환경에서도 예시 인생네컷을 찍을 수 있습니다!
            </p>
          </div>
        )}

        {/* Live Countdown Overlay */}
        {isCounting && countdown > 0 && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center">
            <div className="text-8xl sm:text-9xl font-black text-amber-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-bounce">
              {countdown}
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-bold bg-slate-900/80 px-4 py-1.5 rounded-full mt-4 border border-slate-700">
              포즈를 취하세요! 📸
            </p>
          </div>
        )}

        {/* Camera Overlay Guide Lines */}
        <div className="absolute inset-0 border-[1px] border-white/10 pointer-events-none grid grid-cols-3 grid-rows-3">
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-b border-white/10" />
        </div>
      </div>

      {/* Instant Capture Controls & Thumbnails */}
      <div className="w-full max-w-2xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Instant Trigger */}
        <button
          onClick={() => {
            if (isCounting) {
              setCountdown(0);
            }
          }}
          className="w-full sm:w-auto px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Camera className="w-4 h-4" />
          <span>즉시 촬영하기</span>
        </button>

        {/* Captured Shots Strip Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 max-w-full">
          {Array.from({ length: 6 }).map((_, i) => {
            const shot = shotsRef.current[i];
            return (
              <div
                key={i}
                className={`w-12 h-16 rounded-lg border-2 overflow-hidden flex items-center justify-center transition-all ${
                  shot
                    ? 'border-pink-500 bg-slate-800 shadow-md'
                    : i === currentShotIndex
                    ? 'border-amber-400 bg-slate-900 animate-pulse'
                    : 'border-slate-800 bg-slate-950/60 opacity-40'
                }`}
              >
                {shot ? (
                  <img src={shot.dataUrl} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
