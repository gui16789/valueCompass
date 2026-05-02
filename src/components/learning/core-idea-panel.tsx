"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, ChevronDown, Lightbulb, NotebookText } from "lucide-react";
import type { KnowledgeNode } from "@/lib/learning/nodes";
import { getIdeaDetail } from "@/lib/learning/idea-details";

type CoreIdeaPanelProps = {
  node: KnowledgeNode;
};

export function CoreIdeaPanel({ node }: CoreIdeaPanelProps) {
  const [openIdea, setOpenIdea] = useState(node.coreIdeas[0] ?? "");

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold">核心观点</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        点击每个观点查看具体解释和通俗案例，再决定是否继续问 AI 导师。
      </p>
      <div className="mt-4 space-y-3">
        {node.coreIdeas.map((idea, index) => {
          const isOpen = openIdea === idea;
          const detail = getIdeaDetail(idea, node);
          const mentorDraft = `请详细解释「${idea}」这个观点，结合「${node.title}」和 A 股价值投资实践，给我一个不构成投资建议的通俗例子。`;

          return (
            <div key={idea} className="rounded-lg border border-border bg-background">
              <button
                type="button"
                onClick={() => setOpenIdea(isOpen ? "" : idea)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{idea}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>

              {isOpen ? (
                <div className="border-t border-border px-4 py-4">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <DetailBlock
                      icon={<Lightbulb className="h-4 w-4" aria-hidden />}
                      title="怎么理解"
                      content={detail.explanation}
                    />
                    <DetailBlock
                      icon={<NotebookText className="h-4 w-4" aria-hidden />}
                      title="通俗案例"
                      content={detail.example}
                    />
                  </div>
                  <Link
                    href={`/mentor?role=mentor&draft=${encodeURIComponent(mentorDraft)}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    <Bot className="h-4 w-4" aria-hidden />
                    继续问 AI 导师
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailBlock({
  icon,
  title,
  content
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{content}</p>
    </div>
  );
}
