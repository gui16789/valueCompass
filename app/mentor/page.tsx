import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { MentorChat } from "@/components/mentor/mentor-chat";
import { getMentorWorkspace } from "@/lib/ai/conversations";
import type { AiRole } from "@/lib/ai/types";
import { getModelProvidersWithConfigs } from "@/lib/model-config/queries";

type MentorPageProps = {
  searchParams?: Promise<{
    draft?: string;
    role?: string;
  }>;
};

export default async function MentorPage({ searchParams }: MentorPageProps) {
  const searchParamsPromise: Promise<{ draft?: string; role?: string }> =
    searchParams ?? Promise.resolve({});
  const [params, workspace, providers] = await Promise.all([
    searchParamsPromise,
    getMentorWorkspace(),
    getModelProvidersWithConfigs()
  ]);
  const hasProvider = providers.length > 0;
  const initialRole = normalizeRole(params.role) ?? workspace.activeRole;

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader
            title="AI 投研教练"
            description="用耐心导师讲清概念，用反方委员挑战假设，用考官检验理解，用研究助理整理资料。"
          />
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            模型配置
          </Link>
        </div>
      </section>

      {!hasProvider ? (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">先连接你的模型</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            AI 对话不会内置模型。请先在设置页添加 OpenAI API 兼容提供商，测试成功后再回来使用导师、反方委员、考官和研究助理。
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            去配置模型
          </Link>
        </section>
      ) : (
        <MentorChat
          initialConversations={workspace.conversations}
          initialConversationId={workspace.activeConversationId}
          initialRole={initialRole}
          initialMessages={workspace.messages}
          initialDraft={params.draft ?? ""}
        />
      )}
    </main>
  );
}

function normalizeRole(role: string | undefined): AiRole | null {
  if (role === "mentor" || role === "opponent" || role === "examiner" || role === "research_assistant") {
    return role;
  }

  return null;
}
