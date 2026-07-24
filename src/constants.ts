import { FrameColor, PhotoFilterOption } from './types';

export const FRAME_COLORS: FrameColor[] = [
  { id: 'black', name: '클래식 블랙', hex: '#111111', textColor: '#FFFFFF', accentColor: '#444444' },
  { id: 'white', name: '크리스탈 화이트', hex: '#FFFFFF', textColor: '#111111', accentColor: '#E5E7EB', borderStyle: 'border border-gray-200' },
  { id: 'soft-pink', name: '베이비 핑크', hex: '#FFD1DC', textColor: '#4A1521', accentColor: '#FFA4B6' },
  { id: 'lavender', name: '파스텔 라벤더', hex: '#E6E6FA', textColor: '#2D1B4E', accentColor: '#C8B6FF' },
  { id: 'mint', name: '프레시 민트', hex: '#D8F3DC', textColor: '#1B4332', accentColor: '#B7E4C7' },
  { id: 'sky', name: '스카이 블루', hex: '#D0E1FD', textColor: '#032B69', accentColor: '#A2C4FC' },
  { id: 'beige', name: '웜 베이지', hex: '#F5EBE0', textColor: '#432818', accentColor: '#E3D5CA' },
  { id: 'navy', name: '딥 네이비', hex: '#0B132B', textColor: '#E0E1DD', accentColor: '#1C2541' },
  { id: 'sunset', name: '노을 그라데이션', hex: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', textColor: '#33102C', accentColor: '#FF758C' },
  { id: 'chrome', name: 'Y2K 실버', hex: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #b0b0b0 100%)', textColor: '#111111', accentColor: '#888888' },
  { id: 'charcoal', name: '모던 차콜', hex: '#22252A', textColor: '#F3F4F6', accentColor: '#374151' },
];

export const PHOTO_FILTERS: PhotoFilterOption[] = [
  { id: 'none', name: '원본', cssFilter: 'none' },
  { id: 'soft', name: '뽀샤시', cssFilter: 'brightness(1.08) contrast(0.95) saturate(1.1) sepia(0.05)' },
  { id: 'bw', name: '감성 흑백', cssFilter: 'grayscale(1) contrast(1.1) brightness(0.98)' },
  { id: 'vintage', name: '빈티지 필름', cssFilter: 'sepia(0.35) contrast(0.92) brightness(1.05) saturate(1.15)' },
  { id: 'warm', name: '웜 톤', cssFilter: 'sepia(0.18) saturate(1.2) contrast(1.02) brightness(1.02)' },
  { id: 'vivid', name: '비비드', cssFilter: 'saturate(1.4) contrast(1.1) brightness(1.02)' },
  { id: 'cool', name: '쿨 톤', cssFilter: 'hue-rotate(15deg) saturate(1.1) brightness(1.05)' },
];

export const STICKER_PRESETS = [
  // Props / Accessories
  { id: 's1', content: '👑', type: 'prop', category: '머리띠/소품' },
  { id: 's2', content: '🥳', type: 'prop', category: '머리띠/소품' },
  { id: 's3', content: '🐱', type: 'prop', category: '머리띠/소품' },
  { id: 's4', content: '🐰', type: 'prop', category: '머리띠/소품' },
  { id: 's5', content: '🕶️', type: 'prop', category: '머리띠/소품' },
  { id: 's6', content: '👓', type: 'prop', category: '머리띠/소품' },
  { id: 's7', content: '🎀', type: 'prop', category: '머리띠/소품' },
  { id: 's8', content: '🎩', type: 'prop', category: '머리띠/소품' },
  { id: 's9', content: '🐻', type: 'prop', category: '머리띠/소품' },
  { id: 's10', content: '🐶', type: 'prop', category: '머리띠/소품' },

  // Emojis & Graphics
  { id: 'e1', content: '✨', type: 'emoji', category: '스티커' },
  { id: 'e2', content: '💖', type: 'emoji', category: '스티커' },
  { id: 'e3', content: '❤️', type: 'emoji', category: '스티커' },
  { id: 'e4', content: '🍒', type: 'emoji', category: '스티커' },
  { id: 'e5', content: '⭐', type: 'emoji', category: '스티커' },
  { id: 'e6', content: '🌸', type: 'emoji', category: '스티커' },
  { id: 'e7', content: '🦋', type: 'emoji', category: '스티커' },
  { id: 'e8', content: '🔥', type: 'emoji', category: '스티커' },
  { id: 'e9', content: '🧸', type: 'emoji', category: '스티커' },
  { id: 'e10', content: '🌈', type: 'emoji', category: '스티커' },
  { id: 'e11', content: '🍀', type: 'emoji', category: '스티커' },
  { id: 'e12', content: '💌', type: 'emoji', category: '스티커' },

  // Text Stamps
  { id: 't1', content: '인생네컷', type: 'text', category: '문구 스탬프' },
  { id: 't2', content: 'BEST DAY', type: 'text', category: '문구 스탬프' },
  { id: 't3', content: 'CUTE ♡', type: 'text', category: '문구 스탬프' },
  { id: 't4', content: 'Y2K VIBE', type: 'text', category: '문구 스탬프' },
  { id: 't5', content: 'HAPPY MEMORY', type: 'text', category: '문구 스탬프' },
  { id: 't6', content: 'LOVE YOU', type: 'text', category: '문구 스탬프' },
  { id: 't7', content: 'SMILE :)', type: 'text', category: '문구 스탬프' },
  { id: 't8', content: 'FRIENDS 4EVER', type: 'text', category: '문구 스탬프' },
];

export const DRAWING_COLORS = [
  { name: 'Red', hex: '#FF3B30' },
  { name: 'Pink', hex: '#FF2D55' },
  { name: 'Yellow', hex: '#FFCC00' },
  { name: 'Green', hex: '#34C759' },
  { name: 'Cyan', hex: '#5AC8FA' },
  { name: 'Blue', hex: '#007AFF' },
  { name: 'Purple', hex: '#AF52DE' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Neon Green', hex: '#00FF66' },
  { name: 'Neon Pink', hex: '#FF007F' },
];
