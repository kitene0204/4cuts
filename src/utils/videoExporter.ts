/**
 * Video recording and speed-adjusted timelapse video exporter.
 */

export interface RecordedVideoFrame {
  dataUrl: string; // JPEG/PNG snapshot of booth or camera frame
  timestamp: number;
}

export async function generateTimelapseVideo(
  frames: RecordedVideoFrame[],
  speedMultiplier: number = 1.0, // 1.0, 1.5, 2.0
  onProgress?: (percent: number) => void
): Promise<Blob> {
  if (frames.length === 0) {
    throw new Error('No recorded video frames available.');
  }

  return new Promise((resolve, reject) => {
    try {
      // First, get dimensions from the first frame image
      const img = new Image();
      img.onload = () => {
        const width = img.width || 640;
        const height = img.height || 480;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Determine mimeType supported by browser
        let mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }

        const stream = canvas.captureStream(30); // 30 FPS stream
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };

        mediaRecorder.onerror = (err) => reject(err);

        mediaRecorder.start();

        // Calculate original time deltas between frames, scaled by 1/speedMultiplier
        let currentFrameIndex = 0;

        const drawNextFrame = () => {
          if (currentFrameIndex >= frames.length) {
            // Finish recording after small padding
            setTimeout(() => {
              if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
              }
            }, 200);
            return;
          }

          const frame = frames[currentFrameIndex];
          const frameImg = new Image();
          frameImg.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(frameImg, 0, 0, width, height);

            if (onProgress) {
              onProgress(Math.round(((currentFrameIndex + 1) / frames.length) * 100));
            }

            // Calculate delay to next frame
            let delay = 100; // default 100ms
            if (currentFrameIndex < frames.length - 1) {
              const diff = frames[currentFrameIndex + 1].timestamp - frame.timestamp;
              delay = Math.max(30, Math.min(diff, 1000));
            }

            // Adjust delay based on speed multiplier (1x, 1.5x, 2x)
            const adjustedDelay = Math.max(20, Math.round(delay / speedMultiplier));

            currentFrameIndex++;
            setTimeout(drawNextFrame, adjustedDelay);
          };
          frameImg.onerror = () => {
            currentFrameIndex++;
            drawNextFrame();
          };
          frameImg.src = frame.dataUrl;
        };

        drawNextFrame();
      };
      img.onerror = (e) => reject(e);
      img.src = frames[0].dataUrl;
    } catch (e) {
      reject(e);
    }
  });
}
