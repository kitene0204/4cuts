import { FrameColor, FrameType, PhotoFilter, StickerItem, DrawingPath } from '../types';
import { PHOTO_FILTERS } from '../constants';

interface RenderOptions {
  layout: FrameType;
  photos: string[]; // 4 data URLs
  frameColor: FrameColor;
  customBgHex?: string;
  filter: PhotoFilter;
  stickers: StickerItem[];
  drawings: DrawingPath[];
  titleText: string;
  dateText: string;
  showDate: boolean;
}

export async function renderFrameToCanvas(options: RenderOptions): Promise<HTMLCanvasElement> {
  const {
    layout,
    photos,
    frameColor,
    customBgHex,
    filter,
    stickers,
    drawings,
    titleText,
    dateText,
    showDate,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // High Resolution specs
  const is1x4 = layout === '1x4';
  const width = is1x4 ? 800 : 1200;
  const height = is1x4 ? 2400 : 1500;

  canvas.width = width;
  canvas.height = height;

  // 1. Draw Frame Background
  const bgStyle = customBgHex || frameColor.hex;
  if (bgStyle.startsWith('linear-gradient')) {
    // Parse gradient or default soft fallback gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (bgStyle.includes('ff9a9e')) {
      grad.addColorStop(0, '#ff9a9e');
      grad.addColorStop(1, '#fecfef');
    } else if (bgStyle.includes('e0e0e0')) {
      grad.addColorStop(0, '#e0e0e0');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, '#b0b0b0');
    } else {
      grad.addColorStop(0, '#333333');
      grad.addColorStop(1, '#111111');
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bgStyle;
  }
  ctx.fillRect(0, 0, width, height);

  // 2. Load Photos
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    photos.map((src) => {
      if (!src) return Promise.resolve(null);
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    })
  );

  // 3. Layout Dimensions Calculation
  const filterOption = PHOTO_FILTERS.find((f) => f.id === filter) || PHOTO_FILTERS[0];
  const photoRects: { x: number; y: number; w: number; h: number }[] = [];

  if (is1x4) {
    // 1x4 Vertical Strip
    const marginX = 48;
    const marginTop = 56;
    const footerHeight = 220;
    const gap = 32;
    const photoWidth = width - marginX * 2; // 704px
    const photoHeight = Math.floor((height - marginTop - footerHeight - gap * 3) / 4); // ~488px

    for (let i = 0; i < 4; i++) {
      const px = marginX;
      const py = marginTop + i * (photoHeight + gap);
      photoRects.push({ x: px, y: py, w: photoWidth, h: photoHeight });
    }
  } else {
    // 2x2 Grid Layout
    const marginX = 56;
    const marginTop = 64;
    const footerHeight = 180;
    const gap = 36;
    const photoWidth = Math.floor((width - marginX * 2 - gap) / 2); // 526px
    const photoHeight = Math.floor((height - marginTop - footerHeight - gap) / 2); // 580px

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const idx = row * 2 + col;
        const px = marginX + col * (photoWidth + gap);
        const py = marginTop + row * (photoHeight + gap);
        photoRects.push({ x: px, y: py, w: photoWidth, h: photoHeight });
      }
    }
  }

  // Draw Photos with Filters
  for (let i = 0; i < 4; i++) {
    const rect = photoRects[i];
    const img = loadedImages[i];

    // Photo background placeholder
    ctx.save();
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    if (img) {
      // Apply CSS Filter on Canvas ctx if supported
      ctx.save();
      ctx.filter = filterOption.cssFilter;

      // Object fit cover center
      const imgAspect = img.width / img.height;
      const rectAspect = rect.w / rect.h;
      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height;

      if (imgAspect > rectAspect) {
        sw = img.height * rectAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / rectAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }

    // Photo Inner Border / Shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  // 4. Render Drawings
  drawings.forEach((path) => {
    if (path.points.length < 2) return;
    ctx.save();

    let targetX = 0;
    let targetY = 0;
    let targetW = width;
    let targetH = height;

    if (typeof path.photoIndex === 'number' && photoRects[path.photoIndex]) {
      const rect = photoRects[path.photoIndex];
      targetX = rect.x;
      targetY = rect.y;
      targetW = rect.w;
      targetH = rect.h;

      // Clip drawing inside photo rect
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
    }

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
        ctx.shadowBlur = 12;
      }
    }

    ctx.beginPath();
    path.points.forEach((pt, idx) => {
      // Map percentage points (0-100) to target rect coordinates
      const px = targetX + (pt.x / 100) * targetW;
      const py = targetY + (pt.y / 100) * targetH;

      if (idx === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });
    ctx.stroke();
    ctx.restore();
  });

  // 5. Render Stickers
  stickers.forEach((sticker) => {
    ctx.save();
    let targetX = 0;
    let targetY = 0;
    let targetW = width;
    let targetH = height;

    if (typeof sticker.photoIndex === 'number' && photoRects[sticker.photoIndex]) {
      const rect = photoRects[sticker.photoIndex];
      targetX = rect.x;
      targetY = rect.y;
      targetW = rect.w;
      targetH = rect.h;

      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
    }

    const centerX = targetX + (sticker.x / 100) * targetW;
    const centerY = targetY + (sticker.y / 100) * targetH;

    ctx.translate(centerX, centerY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);

    const baseFontSize = sticker.type === 'text' ? 36 : 64;
    const fontSize = baseFontSize * sticker.scale;

    ctx.font = sticker.type === 'text' ? `bold ${fontSize}px sans-serif` : `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (sticker.type === 'text') {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(sticker.content, 0, 0);
      ctx.fillText(sticker.content, 0, 0);
    } else {
      ctx.fillText(sticker.content, 0, 0);
    }

    ctx.restore();
  });

  // 6. Draw Frame Footer / Header Watermark & Brand Logo
  ctx.save();
  ctx.fillStyle = frameColor.textColor;
  ctx.textAlign = 'center';

  if (is1x4) {
    const footerCenterY = height - 110;

    // Brand Title
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(titleText || 'LIFE FOUR CUTS', width / 2, footerCenterY - 15);

    // Date
    if (showDate) {
      ctx.font = '500 22px sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(dateText, width / 2, footerCenterY + 28);
      ctx.globalAlpha = 1.0;
    }

    // Mini Barcode graphic at bottom right
    ctx.fillStyle = frameColor.textColor;
    ctx.globalAlpha = 0.35;
    const barcodeX = width - 140;
    const barcodeY = height - 70;
    const barWidths = [3, 1, 4, 2, 1, 5, 2, 3, 1, 4, 2, 3];
    let currX = barcodeX;
    barWidths.forEach((w) => {
      ctx.fillRect(currX, barcodeY, w * 2, 30);
      currX += w * 2 + 3;
    });
    ctx.globalAlpha = 1.0;
  } else {
    // 2x2 Layout Footer
    const footerCenterY = height - 90;

    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(titleText || 'LIFE FOUR CUTS', width / 2, footerCenterY - 10);

    if (showDate) {
      ctx.font = '500 22px sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(dateText, width / 2, footerCenterY + 30);
      ctx.globalAlpha = 1.0;
    }
  }

  ctx.restore();

  return canvas;
}
