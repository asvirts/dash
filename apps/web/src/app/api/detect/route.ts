import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { EQUIPMENT, EQUIPMENT_IDS, type EquipmentId } from "@anygym/core";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const Detection = z.object({
  equipment: z.array(
    z.object({
      id: z.enum(EQUIPMENT_IDS as [EquipmentId, ...EquipmentId[]]),
      confidence: z.enum(["high", "medium", "low"]),
      evidence: z.string(),
    }),
  ),
  max_dumbbell_lbs: z.number().nullable(),
  summary: z.string(),
});

const SYSTEM = `You identify fitness equipment (weights, machines and cardio equipment) in photos or video frames of gyms, including hotel and apartment gyms.

Equipment ids you may return:
${EQUIPMENT.map((e) => `- ${e.id}: ${e.label}`).join("\n")}

Rules:
- Only list equipment you can actually see. Do not guess based on what gyms usually have.
- Multi-function cable towers with a lat bar count as cable_machine AND lat_pulldown. A functional trainer is cable_machine.
- "rower" is a cardio rowing machine (ergometer). "row_machine" is a seated strength row machine with a weight stack.
- Upright, recumbent and spin bikes all count as exercise_bike.
- An adjustable bench that also lies flat is "bench". Only use flat_bench for benches that don't adjust.
- For max_dumbbell_lbs, read the heaviest dumbbell's number or estimate from the rack. Convert kg to lb. Use null if there are no dumbbells or you can't tell.
- evidence: a few words on where you saw it ("rack on left wall, 5–50 lb").
- summary: one sentence describing the gym.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json(
      { error: "AI scanning isn't configured (set ANTHROPIC_API_KEY). Pick your equipment manually below." },
      { status: 503 },
    );
  }

  // When accounts are configured, only signed-in users can run (paid) AI scans.
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (sbUrl && sbKey) {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { data } = token ? await createClient(sbUrl, sbKey).auth.getUser(token) : { data: { user: null } };
    if (!data.user) return Response.json({ error: "Sign in to use AI gym scanning." }, { status: 401 });
  }

  const { images } = (await req.json()) as { images?: string[] };
  if (!images?.length) return Response.json({ error: "No images provided." }, { status: 400 });

  const client = new Anthropic();
  try {
    const res = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Detection) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            ...images.slice(0, 8).map((data) => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: data.replace(/^data:image\/\w+;base64,/, ""),
              },
            })),
            {
              type: "text" as const,
              text: `These ${images.length > 1 ? `${images.length} images are photos or frames from a video of` : "image is a photo of"} one gym. List the equipment.`,
            },
          ],
        },
      ],
    });

    if (res.stop_reason === "refusal" || !res.parsed_output) {
      return Response.json({ error: "Couldn't analyze these images. Try another angle or pick manually." }, { status: 422 });
    }
    return Response.json(res.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Too many scans right now. Try again in a minute." }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("detect: API error", err.status, err.message);
      return Response.json({ error: "Scanning failed. Pick your equipment manually." }, { status: 502 });
    }
    throw err;
  }
}
