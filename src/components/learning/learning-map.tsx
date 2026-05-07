"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Building2, CheckCircle2, Circle, Map, Milestone } from "lucide-react";
import { featuredAShareCaseIds, getAShareCaseStudy } from "@/lib/learning/a-share-cases";
import type { KnowledgeNode, KnowledgeNodeType } from "@/lib/learning/nodes";
import { nodeTypeLabels } from "@/lib/learning/nodes";
import type { LearningProgressRow } from "@/lib/learning/progress";
import type { LearningStatus } from "@/lib/learning/status";
import { learningStatusLabels } from "@/lib/learning/status";

type LearningMapProps = {
  nodes: KnowledgeNode[];
  progressByNodeId: Record<string, LearningProgressRow>;
};

const filters: Array<{ value: "all" | KnowledgeNodeType; label: string }> = [
  { value: "all", label: "全部" },
  { value: "timeline", label: "时间线" },
  { value: "school", label: "学派" },
  { value: "person", label: "人物" },
  { value: "book", label: "书籍" },
  { value: "concept", label: "概念" },
  { value: "case", label: "A 股案例" }
];

export function LearningMap({ nodes, progressByNodeId }: LearningMapProps) {
  const [activeType, setActiveType] = useState<"all" | KnowledgeNodeType>("all");
  const timelineNodes = nodes.filter((node) => node.type === "timeline");
  const schoolNodes = nodes.filter((node) => node.type === "school");
  const timelineMinWidth = Math.max(980, timelineNodes.length * 150);
  const featuredCaseNodes = featuredAShareCaseIds
    .map((id) => nodes.find((node) => node.id === id))
    .filter((node): node is KnowledgeNode => Boolean(node));
  const filteredNodes = useMemo(
    () => (activeType === "all" ? nodes : nodes.filter((node) => node.type === activeType)),
    [activeType, nodes]
  );
  const learnedCount = nodes.filter((node) => progressByNodeId[node.id]?.status === "completed").length;
  const inProgressCount = nodes.filter((node) => progressByNodeId[node.id]?.status === "in_progress").length;

  return (
    <div className="space-y-8">
      <section className="hero-panel rounded-lg p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">价值投资学习地图</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              从学派源流到 A 股实践，搭一条自己的学习路径
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              第一批 {nodes.length} 个知识节点覆盖发展史、代表人物、经典书籍、核心概念和 A 股本土案例。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card/80 p-3 text-center">
            <Metric label="节点" value={nodes.length} />
            <Metric label="已学" value={learnedCount} />
            <Metric label="学习中" value={inProgressCount} />
          </div>
        </div>
      </section>

      <section className="page-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">真实 A 股案例库</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            用真实公司训练行业模板、证据清单和反方问题。案例只用于学习研究框架，不构成具体证券建议。
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {featuredCaseNodes.map((node) => {
            const caseStudy = getAShareCaseStudy(node.id);

            return (
              <Link
                key={node.id}
                href={`/learn/${node.id}`}
                className="rounded-lg border border-border bg-background p-4 transition hover:border-primary hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-primary">
                      {caseStudy ? `${caseStudy.companyName} / ${caseStudy.stockCode}` : nodeTypeLabels[node.type]}
                    </div>
                    <h3 className="mt-2 font-semibold">{node.title}</h3>
                  </div>
                  <StatusBadge status={getNodeStatus(progressByNodeId[node.id])} />
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {caseStudy?.caseTheme ?? node.summary}
                </p>
                {caseStudy ? (
                  <div className="mt-4 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {caseStudy.valuationTemplate}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-panel rounded-lg p-6">
        <div className="flex items-center gap-2">
          <Milestone className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">价值投资时间线</h2>
        </div>
        <div className="mt-5 overflow-x-auto pb-2">
          <div
            className="grid gap-3"
            style={{
              minWidth: `${timelineMinWidth}px`,
              gridTemplateColumns: `repeat(${timelineNodes.length}, minmax(130px, 1fr))`
            }}
          >
            {timelineNodes.map((node, index) => (
              <Link
                key={node.id}
                href={`/learn/${node.id}`}
                className="group relative rounded-lg border border-border bg-background p-4 transition hover:border-primary hover:bg-muted"
              >
                {index < timelineNodes.length - 1 ? (
                  <span className="absolute right-[-0.85rem] top-8 hidden h-px w-4 bg-border xl:block" aria-hidden />
                ) : null}
                <div className="text-xs font-semibold text-muted-foreground">{node.period}</div>
                <div className="mt-3 min-h-12 text-sm font-semibold leading-6">{node.title}</div>
                <StatusBadge status={getNodeStatus(progressByNodeId[node.id])} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  {index < timelineNodes.length - 1 ? (
                    <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-panel rounded-lg p-6">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">学派地图</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {schoolNodes.map((node) => (
            <Link
              key={node.id}
              href={`/learn/${node.id}`}
              className="rounded-lg border border-border bg-background p-4 transition hover:border-primary hover:bg-muted"
            >
              <div className="text-xs font-semibold text-primary">{node.school}</div>
              <h3 className="mt-2 font-semibold">{node.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{node.summary}</p>
              <StatusBadge status={getNodeStatus(progressByNodeId[node.id])} />
            </Link>
          ))}
        </div>
      </section>

      <section className="page-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">知识节点</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveType(filter.value)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  activeType === filter.value
                    ? "border-primary bg-muted text-primary"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredNodes.map((node) => (
            <KnowledgeCard key={node.id} node={node} status={getNodeStatus(progressByNodeId[node.id])} />
          ))}
        </div>
      </section>
    </div>
  );
}

function KnowledgeCard({ node, status }: { node: KnowledgeNode; status: LearningStatus }) {
  const completed = status === "completed";

  return (
    <Link
      href={`/learn/${node.id}`}
      className="rounded-lg border border-border bg-background p-4 transition hover:border-primary hover:bg-muted"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-primary">{nodeTypeLabels[node.type]}</div>
          <h3 className="mt-2 font-semibold">{node.title}</h3>
        </div>
        {completed ? (
          <CheckCircle2 className="mt-1 h-4 w-4 text-primary" aria-hidden />
        ) : (
          <Circle className="mt-1 h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{node.summary}</p>
      <StatusBadge status={status} />
      <div className="mt-4 flex flex-wrap gap-2">
        {node.coreIdeas.slice(0, 3).map((idea) => (
          <span key={idea} className="status-chip">
            {idea}
          </span>
        ))}
      </div>
    </Link>
  );
}

function getNodeStatus(progress?: LearningProgressRow): LearningStatus {
  if (progress?.status === "completed" || progress?.status === "in_progress") {
    return progress.status;
  }

  return "not_started";
}

function StatusBadge({ status }: { status: LearningStatus }) {
  const completed = status === "completed";
  const inProgress = status === "in_progress";

  return (
    <span
      className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        completed
          ? "border-primary bg-muted text-primary"
          : inProgress
            ? "border-border bg-card text-foreground"
            : "border-border bg-card text-muted-foreground"
      }`}
    >
      {learningStatusLabels[status]}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
