import { VideoAsset } from "../types";

export const renderVideo = async (assets: VideoAsset): Promise<string> => {
  const canvas = document.createElement('canvas');
  const width = 1280;
  const height = 720;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Load images
  const images = await Promise.all(assets.images.map(src => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }));

  // Setup Audio
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  const source = audioCtx.createBufferSource();
  source.buffer = assets.audio;
  source.connect(dest);
  source.connect(audioCtx.destination); // Optional: hear it while rendering? Maybe muted.

  // Setup Recorder
  const canvasStream = canvas.captureStream(30); // 30 FPS
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: 'video/webm;codecs=vp9'
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };

    recorder.start();
    source.start();

    // Animation Loop
    const duration = assets.audio.duration;
    const startTime = performance.now();
    const sceneDuration = duration / images.length;

    const draw = () => {
      const currentTime = (performance.now() - startTime) / 1000;
      
      if (currentTime >= duration) {
        recorder.stop();
        return; // End
      }

      // Determine current scene
      const sceneIndex = Math.min(
        Math.floor(currentTime / sceneDuration),
        images.length - 1
      );
      const img = images[sceneIndex];
      const caption = assets.captions[sceneIndex];

      // Calculate "Ken Burns" Zoom/Pan
      // Progress within the scene (0 to 1)
      const sceneProgress = (currentTime % sceneDuration) / sceneDuration;
      
      // Simple zoom in effect: scale from 1.0 to 1.2
      const scale = 1.0 + (sceneProgress * 0.2);
      
      // Clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw Image with Transform
      ctx.save();
      // Translate to center
      ctx.translate(width/2, height/2);
      ctx.scale(scale, scale);
      // Translate back
      ctx.translate(-width/2, -height/2);
      
      // Draw image "cover" style
      // Calculate aspect ratios
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawW, drawH, offX, offY;

      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
        offY = 0;
        offX = (width - drawW) / 2;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        offX = 0;
        offY = (height - drawH) / 2;
      }

      ctx.drawImage(img, offX, offY, drawW, drawH);
      ctx.restore();

      // Draw Caption (Meme Text)
      if (caption) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;
        ctx.font = 'bold 48px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Wrap text
        const words = caption.toUpperCase().split(' ');
        let line = '';
        let y = height - 40;
        
        // Simple one-line check, could be better but sufficient for simple memes
        ctx.strokeText(caption.toUpperCase(), width/2, y);
        ctx.fillText(caption.toUpperCase(), width/2, y);
        ctx.restore();
      }

      requestAnimationFrame(draw);
    };

    draw();
  });
};
