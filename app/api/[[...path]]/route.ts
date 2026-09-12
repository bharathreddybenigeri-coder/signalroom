import { NextResponse } from "next/server";

type TelemetryPoint = { id: string; timestamp: number; value: number; secondary: number; series: number };

const accents = ["#ff6b5f", "#1fb8a8", "#7058d8", "#f4b23e", "#e14da3"];
const seededValue = (index: number, series = 0): number => 112 + Math.sin(index / 28 + series * 0.8) * 18 + Math.sin(index / 111) * 12 + Math.sin(index / 7.5 + series) * 4 + series * 8;
const createPoints = (count: number): TelemetryPoint[] => { const now = Date.now(); return Array.from({ length: count }, (_, index) => ({ id: `evt-${now}-${index}`, timestamp: now - (count - index) * 100, value: Math.round(seededValue(index) * 100) / 100, secondary: Math.round(seededValue(index, 1) * 100) / 100, series: index % 5 })); };

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requested = Number(url.searchParams.get("points") || 1200);
    const points = Math.min(Math.max(Number.isFinite(requested) ? requested : 1200, 24), 50000);
    return NextResponse.json({ points: createPoints(points), meta: { generatedAt: new Date().toISOString(), intervalMs: 100, palette: accents } });
  } catch (error) { return NextResponse.json({ error: "Unable to create the telemetry snapshot." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const value = Number(body?.value);
    return NextResponse.json({ accepted: true, point: { id: `manual-${Date.now()}`, timestamp: Date.now(), value: Number.isFinite(value) ? value : 100, secondary: 108, series: 0 } });
  } catch (error) { return NextResponse.json({ error: "Unable to accept telemetry." }, { status: 400 }); }
}