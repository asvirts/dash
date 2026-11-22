"use client";

const MAX_SIDE = 1024;

function drawToJpeg(src: CanvasImageSource, w: number, h: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export async function imageToJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const out = drawToJpeg(bmp, bmp.width, bmp.height);
  bmp.close();
  return out;
}

/** Pull `count` evenly spaced frames out of a video file. */
export async function videoToFrames(file: File, count = 6): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => rej(new Error("Couldn't read that video."));
    });
    const dur = isFinite(video.duration) ? video.duration : 5;
    const frames: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (dur * (i + 0.5)) / count;
      await new Promise<void>((res) => {
        video.onseeked = () => res();
        video.currentTime = t;
      });
      frames.push(drawToJpeg(video, video.videoWidth, video.videoHeight));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}
