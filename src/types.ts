export type FrameType = '1x4' | '2x2';

export interface Shot {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface StickerItem {
  id: string;
  photoIndex: number | 'frame'; // index 0-3 for photo, or 'frame'
  content: string; // Emoji, SVG string, or text
  type: 'emoji' | 'prop' | 'text';
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  scale: number; // 0.5 to 3
  rotation: number; // degrees -180 to 180
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  photoIndex: number | 'frame';
  points: Point[];
  color: string;
  size: number;
  tool: 'pen' | 'neon' | 'eraser';
}

export type Step = 'setup' | 'shooting' | 'selecting' | 'editing' | 'result';

export interface FrameColor {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  accentColor: string;
  borderStyle?: string;
}

export type PhotoFilter = 'none' | 'bw' | 'vintage' | 'warm' | 'soft' | 'vivid' | 'cool';

export interface PhotoFilterOption {
  id: PhotoFilter;
  name: string;
  cssFilter: string;
}

export interface VideoRecordFrame {
  dataUrl: string;
  timestamp: number;
}
