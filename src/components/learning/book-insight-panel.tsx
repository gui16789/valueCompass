import { Quote, Sparkles, TriangleAlert, Workflow } from "lucide-react";
import type { BookInsight } from "@/lib/learning/book-insights";

type BookInsightPanelProps = {
  insight: BookInsight;
};

export function BookInsightPanel({ insight }: BookInsightPanelProps) {
  return (
    <div className="page-panel rounded-lg p-5">
      <h2 className="font-semibold">全书主干</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.readingFocus}</p>

      <div className="mt-5 space-y-3">
        {insight.keyPoints.map((point, index) => (
          <div key={point.title} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.explanation}</p>
                <div className="mt-3 rounded-md border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    通俗案例
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.example}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <InsightBlock
          icon={<TriangleAlert className="h-4 w-4" aria-hidden />}
          title="反常识观点"
          items={insight.counterIntuitiveIdeas.map(
            (idea) => `${idea.title}：${idea.explanation}`
          )}
        />
        <InsightBlock
          icon={<Quote className="h-4 w-4" aria-hidden />}
          title="经典表达（转述）"
          items={insight.classicExpressions}
        />
      </div>

      <div className="mt-4">
        <InsightBlock
          icon={<Workflow className="h-4 w-4" aria-hidden />}
          title="读完要转成的投资动作"
          items={insight.practiceActions}
        />
      </div>
    </div>
  );
}

function InsightBlock({
  icon,
  title,
  items
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 font-semibold text-primary">
        {icon}
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border border-border bg-card px-3 py-2 text-sm leading-6 text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
