import { NextResponse } from "next/server";
import { getEastmoneyMarketSnapshot } from "@/lib/market-data/eastmoney";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? searchParams.get("secid") ?? "";

  try {
    const snapshot = await getEastmoneyMarketSnapshot(symbol);
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "估值快照获取失败。"
      },
      { status: 502 }
    );
  }
}
