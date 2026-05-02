import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { aiConversations, aiMessages } from "@/db/schema";
import { callOpenAICompatibleChat } from "@/lib/ai/openai-compatible";
import type { AiRole, ChatMessage } from "@/lib/ai/types";
import { hasDirectTradingAdvice, sanitizeDirectTradingAdvice } from "@/lib/ai/guardrails";
import { getAiRoleSystemPrompt } from "@/lib/ai/prompts";
import { decryptSecret } from "@/lib/encryption/crypto";
import { getModelProviderForRole } from "@/lib/model-config/queries";

const MAX_HISTORY_MESSAGES = 16;

export type ConversationSummary = {
  id: string;
  title: string;
  role: AiRole;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

function now() {
  return new Date().toISOString();
}

function toAiRole(role: string): AiRole {
  if (role === "opponent" || role === "examiner" || role === "research_assistant") {
    return role;
  }

  return "mentor";
}

function createTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length > 24 ? `${compact.slice(0, 24)}...` : compact || "新的导师对话";
}

export async function getMentorWorkspace() {
  const conversations = await db
    .select()
    .from(aiConversations)
    .orderBy(desc(aiConversations.updatedAt));

  const activeConversation = conversations[0];
  const messages = activeConversation
    ? await getConversationMessages(activeConversation.id)
    : [];

  return {
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      role: toAiRole(conversation.role),
      updatedAt: conversation.updatedAt
    })),
    activeConversationId: activeConversation?.id ?? null,
    activeRole: toAiRole(activeConversation?.role ?? "mentor"),
    messages
  };
}

export async function getConversationMessages(conversationId: string) {
  const rows = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt);

  return rows
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: message.content,
      createdAt: message.createdAt
    }));
}

export async function sendAiConversationMessage({
  conversationId,
  role,
  content
}: {
  conversationId?: string | null;
  role: AiRole;
  content: string;
}) {
  const modelConfig = await getModelProviderForRole(role);

  if (!modelConfig) {
    throw new Error("还没有可用的模型配置。请先到设置页新增并测试模型提供商。");
  }

  const sentAt = now();
  const normalizedContent = content.trim();
  let currentConversationId = conversationId ?? "";

  if (currentConversationId) {
    const [existingConversation] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, currentConversationId));

    if (!existingConversation) {
      currentConversationId = "";
    }
  }

  if (!currentConversationId) {
    currentConversationId = crypto.randomUUID();
    await db.insert(aiConversations).values({
      id: currentConversationId,
      title: createTitle(normalizedContent),
      role,
      providerId: modelConfig.provider.id,
      createdAt: sentAt,
      updatedAt: sentAt
    });
  } else {
    await db
      .update(aiConversations)
      .set({
        role,
        providerId: modelConfig.provider.id,
        updatedAt: sentAt
      })
      .where(eq(aiConversations.id, currentConversationId));
  }

  const historyRows = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, currentConversationId))
    .orderBy(desc(aiMessages.createdAt))
    .limit(MAX_HISTORY_MESSAGES);

  await db.insert(aiMessages).values({
    id: crypto.randomUUID(),
    conversationId: currentConversationId,
    role: "user",
    content: normalizedContent,
    modelName: "",
    temperature: 0,
    createdAt: sentAt
  });

  const chatMessages: ChatMessage[] = [
    {
      role: "system",
      content: getAiRoleSystemPrompt(role)
    },
    ...historyRows
      .reverse()
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content
      })),
    {
      role: "user",
      content: normalizedContent
    }
  ];

  const rawAssistantContent = await callOpenAICompatibleChat({
    config: {
      apiBaseUrl: modelConfig.provider.apiBaseUrl,
      apiKey: decryptSecret(modelConfig.provider.apiKeyEncrypted),
      model: modelConfig.modelName,
      temperature: modelConfig.temperature / 100,
      allowInsecureTls: modelConfig.provider.allowInsecureTls
    },
    messages: chatMessages
  });

  const assistantContent = hasDirectTradingAdvice(rawAssistantContent)
    ? sanitizeDirectTradingAdvice(rawAssistantContent)
    : rawAssistantContent;
  const answeredAt = now();
  const assistantMessageId = crypto.randomUUID();

  await db.insert(aiMessages).values({
    id: assistantMessageId,
    conversationId: currentConversationId,
    role: "assistant",
    content: assistantContent,
    modelName: modelConfig.modelName,
    temperature: modelConfig.temperature,
    createdAt: answeredAt
  });

  await db
    .update(aiConversations)
    .set({
      updatedAt: answeredAt
    })
    .where(eq(aiConversations.id, currentConversationId));

  return {
    conversationId: currentConversationId,
    assistantMessage: {
      id: assistantMessageId,
      role: "assistant" as const,
      content: assistantContent,
      createdAt: answeredAt
    }
  };
}
