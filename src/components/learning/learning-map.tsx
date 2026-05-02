"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Map, Milestone } from "lucide-react";
import type { KnowledgeNode, KnowledgeNodeType } from "@/lib/learning/nodes";
import { nodeTypeLabels } from "@/lib/learning/nodes";

type LearningMapProps = {
  nodes: KnowledgeNode[];
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

export function LearningMap({ nodes }: LearningMapProps) {
  const [activeType, setActiveType] = useState<"all" | KnowledgeNodeType>("all");
  const timelineNodes = nodes.filter((node) => node.type === "timeline");
  const schoolNodes = nodes.filter((node) => node.type === "school");
  const filteredNodes = useMemo(
    () => (activeType === "all" ? nodes : nodes.filter((node) => node.type === activeType)),
    [activeType, nodes]
  );
  const learnedCount = 0;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
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
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3 text-center">
            <Metric label="节点" value={nodes.length} />
            <Metric label="已学" value={learnedCount} />
            <Metric label="案例" value={nodes.filter((node) => node.type === "case").length} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Milestone className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">价值投资时间线</h2>
        </div>
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="grid min-w-[980px] grid-cols-8 gap-3">
            {timelineNodes.map((node, index) => (
              <Link
                key={node.id}
                href={`/learn/${node.id}`}
                className="group rounded-lg border border-border bg-background p-4 transition hover:border-primary hover:bg-muted"
              >
                <div className="text-xs font-semibold text-muted-foreground">{node.period}</div>
                <div className="mt-3 min-h-12 text-sm font-semibold leading-6">{node.title}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">0{index + 1}</span>
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

      <section className="rounded-lg border border-border bg-card p-6">
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
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
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
                    ? "border-primary bg-muted"
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
            <KnowledgeCard key={node.id} node={node} />
          ))}
        </div>
      </section>
    </div>
  );
}

function KnowledgeCard({ node }: { node: KnowledgeNode }) {
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
        <Circle className="mt-1 h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{node.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {node.coreIdeas.slice(0, 3).map((idea) => (
          <span key={idea} className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
            {idea}
          </span>
        ))}
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-card px-4 py-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
