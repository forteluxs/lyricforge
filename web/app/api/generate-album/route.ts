import { NextRequest } from "next/server";
import { loadReferences, generateOneSong } from "@/lib/generator";

export const maxDuration = 300; // 5 min max for 15 songs

export async function POST(req: NextRequest) {
  const { genre, bahasa, narasi, albumTitle, albumConcept } = await req.json();

  if (!genre || !bahasa || !narasi) {
    return new Response(JSON.stringify({ error: "genre, bahasa, dan narasi wajib diisi" }), { status: 400 });
  }

  // Load references once, reuse for all 15 songs
  const references = loadReferences(genre);

  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (!cancelled) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      };

      try {
        for (let pos = 1; pos <= 15; pos++) {
          if (cancelled) break;

          // Notify client: currently generating this position
          send({ type: "progress", position: pos, total: 15 });

          const song = await generateOneSong({
            genre, bahasa, narasi, position: pos,
            albumTitle, albumConcept, references,
          });

          send({ type: "song", ...song });
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
      } finally {
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
