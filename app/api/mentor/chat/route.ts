import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAiConversationMessage } from "@/lib/ai/conversations";
import type { AiRole } from "@/lib/ai/types";

const chatRequestSchema = z.object({
  conversationId: z.string().optional().nullable(),
  role: z.enum(["mentor", "opponent", "examiner", "research_assistant"]),
  content: z.string().trim().min(1, "请输入要咨询的问题。").max(8000, "单次消息不能超过 8000 字。")
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "请求格式不正确。"
      },
      { status: 400 }
    );
  }

  try {
    const result = await sendAiConversationMessage({
      conversationId: parsed.data.conversationId,
      role: parsed.data.role as AiRole,
      content: parsed.data.content
    });

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "AI 导师暂时无法回复。"
      },
      { status: 500 }
    );
  }
}
