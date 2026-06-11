import { NextResponse } from "next/server";
import { getStats, incrementStats } from "@/lib/stats";

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}

export async function POST(req: Request) {
  try {
    const { type, amount = 1 } = await req.json();
    const stats = incrementStats(type, amount);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
