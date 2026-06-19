import { NextRequest, NextResponse } from "next/server";
import { client, loadReferences, ARC_ROLES, SYSTEM_PROMPT, parseResult } from "@/lib/generator";

export async function POST(req: NextRequest) {
  try {
    const { genre, bahasa, narasi, albumMode, albumTitle, albumConcept, songPosition } =
      await req.json();

    if (!genre || !bahasa || !narasi) {
      return NextResponse.json({ error: "genre, bahasa, dan narasi wajib diisi" }, { status: 400 });
    }

    const references = loadReferences(genre, bahasa);
    let userMessage = `Genre: ${genre}\nBahasa/Language: ${bahasa}\nNarasi/Tema: ${narasi}`;

    if (albumMode && songPosition) {
      const pos = parseInt(songPosition);
      const arcRole = ARC_ROLES[pos] || "";
      userMessage += `\n\n--- ALBUM MODE ---`;
      if (albumTitle)   userMessage += `\nAlbum: "${albumTitle}"`;
      if (albumConcept) userMessage += `\nKonsep Album: ${albumConcept}`;
      userMessage += `\nPosisi Lagu: ${pos} dari 15`;
      if (arcRole)      userMessage += `\nPeran dalam Arc: ${arcRole}`;
      if (pos === 15)   userMessage += `\nPenting: Lagu penutup — harus ada echo/callback ke tema lagu 1. Tutup lingkaran.`;
      if (pos === 8)    userMessage += `\nPenting: Titik paling gelap album — stripped-down, hanya kata paling esensial.`;
    }

    userMessage += `\n\nBuat 1 lagu lengkap sesuai format yang diminta.`;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + (references ? "\n\n---\nREFERENCE MATERIAL:\n" + references : "") },
        { role: "user",   content: userMessage },
      ],
      temperature: 1.0,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || "";
    
    // Increment lyrics counter (asynchronous, don't await so it doesn't slow down response)
    import("@/lib/stats").then(m => m.incrementStats("lyrics", 1)).catch(() => {});

    return NextResponse.json(parseResult(text));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
