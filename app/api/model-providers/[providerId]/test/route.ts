import { NextResponse } from "next/server";
import { runModelProviderTest } from "@/lib/model-config/test-provider";

type RouteContext = {
  params: Promise<{
    providerId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { providerId } = await context.params;
  const result = await runModelProviderTest(providerId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
