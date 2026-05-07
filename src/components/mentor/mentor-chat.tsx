"use client";

import { useMemo, useState } from "react";
import { Bot, ChevronDown, ChevronUp, MessageSquarePlus, Send, ShieldAlert, UserRound } from "lucide-react";
import { aiRoles } from "@/lib/model-config/constants";
import type {
  ConversationMessage,
  ConversationSummary
} from "@/lib/ai/conversations";
import type { AiRole } from "@/lib/ai/types";

type MentorChatProps = {
  initialConversations: ConversationSummary[];
  initialConversationId: string | null;
  initialRole: AiRole;
  initialMessages: ConversationMessage[];
  initialDraft?: string;
};

export function MentorChat({
  initialConversations,
  initialConversationId,
  initialRole,
  initialMessages,
  initialDraft = ""
}: MentorChatProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [activeRole, setActiveRole] = useState<AiRole>(initialRole);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState(initialDraft);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeRoleMeta = useMemo(
    () => aiRoles.find((role) => role.value === activeRole) ?? aiRoles[0],
    [activeRole]
  );

  function startNewConversation(role: AiRole = activeRole) {
    setActiveConversationId(null);
    setActiveRole(role);
    setMessages([]);
    setErrorMessage("");
  }

  async function selectConversation(conversation: ConversationSummary) {
    setActiveConversationId(conversation.id);
    setActiveRole(conversation.role);
    setErrorMessage("");

    const response = await fetch(`/api/mentor/conversations/${conversation.id}`);
    const data = (await response.json()) as {
      messages?: ConversationMessage[];
      message?: string;
    };

    if (!response.ok) {
      setErrorMessage(data.message ?? "对话加载失败。");
      return;
    }

    setMessages(data.messages ?? []);
  }

  async function sendMessage() {
    const content = input.trim();

    if (!content || isSending) {
      return;
    }

    const optimisticMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    setMessages((current) => [...current, optimisticMessage]);
    setInput("");
    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          role: activeRole,
          content
        })
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        conversationId?: string;
        assistantMessage?: ConversationMessage;
      };

      if (!response.ok || !data.ok || !data.assistantMessage || !data.conversationId) {
        throw new Error(data.message ?? "AI 导师暂时无法回复。");
      }

      setActiveConversationId(data.conversationId);
      setMessages((current) => [...current, data.assistantMessage as ConversationMessage]);
      setConversations((current) => upsertConversation(current, data.conversationId as string, content, activeRole));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "AI 导师暂时无法回复。");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <aside className="page-panel rounded-lg p-4">
        <button
          type="button"
          onClick={() => startNewConversation()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden />
          新建对话
        </button>

        <div className="mt-5 space-y-2">
          {conversations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
              还没有对话。选择一个角色，先问一个价值投资问题。
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation)}
                className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  activeConversationId === conversation.id
                    ? "border-primary bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="block truncate font-semibold">{conversation.title}</span>
                <span className="mt-1 block text-xs">
                  {aiRoles.find((role) => role.value === conversation.role)?.label ?? "AI 导师"}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="page-panel min-h-[640px] overflow-hidden rounded-lg">
        <div className="border-b border-border bg-card/70 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" aria-hidden />
                <h1 className="text-xl font-semibold">{activeRoleMeta.label}</h1>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {activeRoleMeta.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {aiRoles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => startNewConversation(role.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    activeRole === role.value
                    ? "border-primary bg-muted text-primary"
                    : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
              <p className="text-sm leading-6 text-muted-foreground">
                AI 只用于学习、研究、质询和复盘，不输出买入、卖出或持有建议；最终判断由你依据自己的原则完成。
              </p>
            </div>
          </div>

          <div className="min-h-[360px] space-y-4 rounded-lg border border-border bg-background/65 p-4">
            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm font-semibold">从一个具体问题开始</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  例如：安全边际为什么不是简单打折？或者请反方委员质疑我的估值假设。
                </p>
              </div>
            ) : (
              messages.map((message) => <ChatBubble key={message.id} message={message} />)
            )}
            {isSending ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                {activeRoleMeta.label}正在思考...
              </div>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
              {errorMessage}
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  void sendMessage();
                }
              }}
              rows={4}
              placeholder="输入你的问题、投资理由、估值假设或粘贴一段资料..."
              className="w-full resize-none bg-transparent text-sm leading-6 outline-none"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Cmd/Ctrl + Enter 发送</span>
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
                {isSending ? "发送中..." : "发送"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChatBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongAssistantMessage = !isUser && isLongMessage(message.content);

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Bot className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
      <div
        className={`max-w-3xl rounded-lg border px-4 py-3 text-sm leading-6 ${
          isUser
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-background text-foreground"
        }`}
      >
        <div
          className={`whitespace-pre-wrap ${
            isLongAssistantMessage && !isExpanded
              ? "max-h-[360px] overflow-y-auto pr-2"
              : ""
          }`}
        >
          {message.content}
        </div>
        {isLongAssistantMessage ? (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                展开全文
              </>
            )}
          </button>
        ) : null}
      </div>
      {isUser ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
          <UserRound className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

function isLongMessage(content: string) {
  return content.length > 700 || content.split("\n").length > 18;
}

function upsertConversation(
  conversations: ConversationSummary[],
  conversationId: string,
  content: string,
  role: AiRole
) {
  const existing = conversations.find((conversation) => conversation.id === conversationId);
  const title = content.length > 24 ? `${content.slice(0, 24)}...` : content;
  const nextConversation: ConversationSummary = {
    id: conversationId,
    title: existing?.title ?? title,
    role,
    updatedAt: new Date().toISOString()
  };

  return [
    nextConversation,
    ...conversations.filter((conversation) => conversation.id !== conversationId)
  ];
}
