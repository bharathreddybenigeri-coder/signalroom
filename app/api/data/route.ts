import { NextResponse } from "next/server";
import { generateInitialDataset } from "@/lib/dataGenerator";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requested = Number(url.searchParams.get("points") || 1200);
    const count = Math.min(Math.max(Number.isFinite(requested) ? requested : 1200, 24), 50000);
    return NextResponse.json(
      {
        points: generateInitialDataset(count),
        meta: {
          generatedAt: new Date().toISOString(),
          intervalMs: 100,
          count,
          palette: ["#ff6b5f", "#1fb8a8", "#7058d8", "#f4b23e", "#e14da3"],
        },
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    return NextResponse.json({ error: "Unable to create the telemetry snapshot." }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const value = Number((body as { value?: number })?.value);
    return NextResponse.json(
      {
        accepted: true,
        point: {
          id: `manual-${Date.now()}`,
          timestamp: Date.now(),
          value: Number.isFinite(value) ? value : 100,
          secondary: 108,
          series: 0,
        },
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    return NextResponse.json({ error: "Unable to accept telemetry." }, { status: 400, headers: CORS_HEADERS });
  }
}
