import type { EquipmentId } from "@anygym/core";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { API_URL } from "./supabase";

export type Frame = { uri: string; base64: string; fromVideo: boolean };

export type Detection = {
  equipment: { id: EquipmentId; confidence: "high" | "medium" | "low"; evidence: string }[];
  max_dumbbell_lbs: number | null;
  summary: string;
};

const MAX_SIDE = 1024;
const VIDEO_FRAMES = 6;
export const MAX_FRAMES = 8;

async function toJpeg(uri: string, width: number, height: number): Promise<Frame | null> {
  const ctx = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > MAX_SIDE) ctx.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ base64: true, compress: 0.7, format: SaveFormat.JPEG });
  return out.base64 ? { uri: out.uri, base64: out.base64, fromVideo: false } : null;
}

async function framesFromAsset(a: ImagePicker.ImagePickerAsset): Promise<Frame[]> {
  if (a.type !== "video") {
    const f = await toJpeg(a.uri, a.width || MAX_SIDE, a.height || MAX_SIDE);
    return f ? [f] : [];
  }
  const durationMs = a.duration && a.duration > 0 ? a.duration : 5000;
  const frames: Frame[] = [];
  for (let i = 0; i < VIDEO_FRAMES; i++) {
    const time = Math.round((durationMs * (i + 0.5)) / VIDEO_FRAMES);
    try {
      const t = await VideoThumbnails.getThumbnailAsync(a.uri, { time, quality: 0.8 });
      const f = await toJpeg(t.uri, t.width, t.height);
      if (f) frames.push({ ...f, fromVideo: true });
    } catch {
      // Skip frames the decoder can't produce (e.g. past the end).
    }
  }
  return frames;
}

/** Let the user capture or pick photos / a video of the gym and return JPEG frames. */
export async function captureGym(source: "camera" | "library"): Promise<Frame[]> {
  const perm =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error(`Allow ${source === "camera" ? "camera" : "photo library"} access in Settings to scan a gym.`);

  const res =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images", "videos"], videoMaxDuration: 30, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          allowsMultipleSelection: true,
          selectionLimit: 6,
          quality: 0.8,
        });
  if (res.canceled) return [];
  const out: Frame[] = [];
  for (const a of res.assets) out.push(...(await framesFromAsset(a)));
  return out;
}

/** Spread the frame budget evenly across everything captured. */
function sample(frames: Frame[]) {
  if (frames.length <= MAX_FRAMES) return frames;
  const step = frames.length / MAX_FRAMES;
  return Array.from({ length: MAX_FRAMES }, (_, i) => frames[Math.floor(i * step)]);
}

export async function detectEquipment(frames: Frame[], accessToken: string | null): Promise<Detection> {
  if (!API_URL) throw new Error("AI scanning isn't configured (set EXPO_PUBLIC_API_URL). Pick equipment manually below.");
  const res = await fetch(`${API_URL}/api/detect`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ images: sample(frames).map((f) => f.base64) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Scan failed (${res.status}).`);
  return data as Detection;
}
