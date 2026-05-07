import { NextResponse } from "next/server";
import { searchEastmoneyStocks } from "@/lib/market-data/eastmoney";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q") ?? "";

  try {
    const results = await searchEastmoneyStocks(keyword);
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "股票搜索失败。"
      },
      { status: 502 }
    );
  }
}
