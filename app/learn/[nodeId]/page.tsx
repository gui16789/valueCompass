import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, CheckCircle2 } from "lucide-react";
import { BookInsightPanel } from "@/components/learning/book-insight-panel";
import { CoreIdeaPanel } from "@/components/learning/core-idea-panel";
import { PendingButton } from "@/components/ui/pending-button";
import { getBookInsight } from "@/lib/learning/book-insights";
import {
  getKnowledgeNode,
  getRelatedNodes,
  knowledgeNodes,
  nodeTypeLabels
} from "@/lib/learning/nodes";
import { getLearningProgressByNodeId } from "@/lib/learning/progress";
import { learningStatusLabels, type LearningStatus } from "@/lib/learning/status";
import { updateLearningStatus } from "../actions";

type NodeDetailPageProps = {
  params: Promise<{
    nodeId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NodeDetailPage({ params }: NodeDetailPageProps) {
  const { nodeId } = await params;
  const node = getKnowledgeNode(nodeId);

  if (!node) {
    notFound();
  }

  const relatedNodes = getRelatedNodes(node);
  const bookInsight = node.type === "book" ? getBookInsight(node.id) : null;
  const progressByNodeId = await getLearningProgressByNodeId();
  const status = getLearningStatus(progressByNodeId[node.id]?.status);
  const mentorDraft = `请用通俗语言解释「${node.title}」，并结合 A 股价值投资实践举一个不构成投资建议的例子。`;

  return (
    <main className="space-y-6">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回学习地图
      </Link>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
              <span>{nodeTypeLabels[node.type]}</span>
              <span>/</span>
              <span>{node.period}</span>
              <span>/</span>
              <span>{node.school}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">{node.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{node.summary}</p>
          </div>
          <Link
            href={`/mentor?role=mentor&draft=${encodeURIComponent(mentorDraft)}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Bot className="h-4 w-4" aria-hidden />
            问 AI 导师
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {bookInsight ? <BookInsightPanel insight={bookInsight} /> : <CoreIdeaPanel node={node} />}
          <InfoPanel title="A 股适配" items={node.aShareNotes} />
          <InfoPanel title="常见误解" items={node.misunderstandings} />
          <InfoPanel title="实践动作" items={node.practiceActions} />
        </div>

        <aside className="space-y-6">
          <LearningStatusPanel nodeId={node.id} status={status} />

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">经典书籍</h2>
            <div className="mt-3 space-y-2">
              {node.books.map((book) => (
                <div key={book} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {book}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">相关节点</h2>
            <div className="mt-3 space-y-2">
              {relatedNodes.map((related) => (
                <Link
                  key={related.id}
                  href={`/learn/${related.id}`}
                  className="block rounded-md border border-border bg-background px-3 py-2 text-sm transition hover:border-primary hover:bg-muted"
                >
                  <span className="text-xs text-primary">{nodeTypeLabels[related.type]}</span>
                  <span className="mt-1 block font-semibold">{related.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function getLearningStatus(status?: string): LearningStatus {
  if (status === "completed" || status === "in_progress") {
    return status;
  }

  return "not_started";
}

function LearningStatusPanel({ nodeId, status }: { nodeId: string; status: LearningStatus }) {
  const actions: Array<{ status: LearningStatus; label: string; pending: string }> = [
    { status: "in_progress", label: "标记学习中", pending: "保存中" },
    { status: "completed", label: "标记已学完", pending: "保存中" },
    { status: "not_started", label: "重置状态", pending: "重置中" }
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold">学习状态</h2>
      <div className="mt-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
        当前：<span className="font-semibold text-primary">{learningStatusLabels[status]}</span>
      </div>
      <div className="mt-3 grid gap-2">
        {actions.map((item) => (
          <form key={item.status} action={updateLearningStatus}>
            <input type="hidden" name="nodeId" value={nodeId} />
            <input type="hidden" name="status" value={item.status} />
            <PendingButton
              pendingChildren={item.pending}
              disabled={status === item.status}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
            >
              {item.label}
            </PendingButton>
          </form>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        状态会保存到本地数据库，用来计算学习地图进度和后续复习建议。
      </p>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-md border border-border bg-background p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-6 text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
