import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DrawingPath, Point } from '../types';

interface DrawingCanvasProps {
  paths: DrawingPath[];
  onAddPath: (path: DrawingPath) => void;
  onClearPaths: () => void;
  tool: 'pen' | 'neon' | 'eraser';
  color: string;
  size: number;
  photoIndex: number | 'frame';
  disabled?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  paths,
  onAddPath,
  tool,
  color,
  size,
  photoIndex,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<Point[]>([]);

  // Filter paths for this specific photo/frame target
  const activePaths = paths.filter((p) => p.photoIndex === photoIndex);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    activePaths.forEach((path) => {
      if (path.points.length < 1) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = path.size * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size;

        if (path.tool === 'neon') {
          ctx.shadowColor = path.color;
          ctx.shadowBlur = 10;
        }
      }

      ctx.beginPath();
      path.points.forEach((pt, i) => {
        const px = (pt.x / 100) * canvas.width;
        const py = (pt.y / 100) * canvas.height;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });

      if (path.points.length === 1) {
        // Draw dot
        const pt = path.points[0];
        const px = (pt.x / 100) * canvas.width;
        const py = (pt.y / 100) * canvas.height;
        ctx.arc(px, py, path.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = path.color;
        ctx.fill();
      } else {
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [activePaths]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        redrawCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [activePaths, redrawCanvas]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const pt = getCanvasPoint(e);
    if (!pt) return;

    setIsDrawing(true);
    currentPointsRef.current = [pt];

    // Live stroke feedback
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        if (tool === 'neon') {
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        const px = (pt.x / 100) * canvas.width;
        const py = (pt.y / 100) * canvas.height;
        ctx.arc(px, py, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }
    }
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const pt = getCanvasPoint(e);
    if (!pt) return;

    currentPointsRef.current.push(pt);

    const canvas = canvasRef.current;
    if (canvas && currentPointsRef.current.length >= 2) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = size * 2;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          if (tool === 'neon') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
          }
        }

        const len = currentPointsRef.current.length;
        const p1 = currentPointsRef.current[len - 2];
        const p2 = currentPointsRef.current[len - 1];

        ctx.beginPath();
        ctx.moveTo((p1.x / 100) * canvas.width, (p1.y / 100) * canvas.height);
        ctx.lineTo((p2.x / 100) * canvas.width, (p2.y / 100) * canvas.height);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || disabled) return;
    setIsDrawing(false);

    if (currentPointsRef.current.length > 0) {
      const newPath: DrawingPath = {
        id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        photoIndex,
        points: [...currentPointsRef.current],
        color,
        size,
        tool,
      };
      onAddPath(newPath);
      currentPointsRef.current = [];
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-auto touch-none"
      onMouseDown={startDrawing}
      onMouseMove={drawMove}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={drawMove}
      onTouchEnd={stopDrawing}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
    </div>
  );
};
