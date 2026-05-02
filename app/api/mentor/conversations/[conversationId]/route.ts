import { NextResponse } from "next/server";
import { getConversationMessages } from "@/lib/ai/conversations";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  const messages = await getConversationMessages(conversationId);

  return NextResponse.json({
    ok: true,
    messages
  });
}
