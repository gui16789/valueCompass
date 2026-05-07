import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck2,
  ClipboardCheck,
  LineChart,
  SearchCheck,
  ShieldCheck
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { knowledgeNodes } from "@/lib/learning/nodes";

const modules = [
  {
    title: "学习地图",
    description: "从经典学派到 A 股案例，补齐价值投资底层框架。",
    href: "/learn",
    icon: BookOpen
  },
  {
    title: "AI 导师",
    description: "既能耐心讲清概念，也会追问你的假设和漏洞。",
    href: "/mentor",
    icon: Brain
  },
  {
    title: "估值工具",
    description: "用四类 A 股模板，把价格、假设和安全边际算明白。",
    href: "/valuations",
    icon: LineChart
  },
  {
    title: "投资纪律",
    description: "用原则、清单、日志和复盘，减少情绪化决策。",
    href: "/system",
    icon: ShieldCheck
  }
];

const dashboardMetrics = [
  { label: "学习进度", value: "18%", hint: "3 个节点学习中", icon: BookOpen },
  { label: "观察池", value: "12", hint: "4 家在能力圈", icon: SearchCheck },
  { label: "待复盘", value: "2", hint: "本周优先处理", icon: CalendarCheck2 },
  { label: "待检查", value: "3", hint: "不操作同样记录", icon: ClipboardCheck }
];

const watchStatuses = ["观察", "深研", "等价格", "持有", "排除"];

const nextActions = [
  "完成安全边际概念复习",
  "补充招商银行资产质量证据",
  "复盘上一份不操作清单"
];

export default function HomePage() {
  const timelineNodes = knowledgeNodes.filter((node) => node.type === "timeline");
  const timelineMinWidth = Math.max(980, timelineNodes.length * 150);

  return (
    <main className="space-y-10">
      <section className="hero-panel rounded-lg p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold text-primary">今日工作台</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-foreground">
              从学习、研究到复盘，搭建自己的 A 股投资系统
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              把碎片化学习、公司研究、估值判断、买卖纪律和复盘改进串成一条流程。AI 负责解释、质询和整理，最终判断回到你的原则与清单。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                继续学习
              </Link>
              <Link
                href="/watchlist"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                <SearchCheck className="h-4 w-4" aria-hidden />
                查看观察池
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {dashboardMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="metric-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground">{metric.label}</div>
                      <div className="mt-2 text-3xl font-semibold">{metric.value}</div>
                    </div>
                    <span className="rounded-md bg-muted p-2 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <div className="mt-3 text-xs leading-5 text-muted-foreground">{metric.hint}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="page-panel rounded-lg p-6">
          <SectionHeader
            title="价值投资时间线"
            description="沿着经典学派、关键人物和 A 股本土案例，建立自己的价值投资知识地图。"
          />
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
                    <span className="absolute right-[-0.85rem] top-8 hidden h-px w-4 bg-border md:block" aria-hidden />
                  ) : null}
                  <div className="text-xs font-semibold text-muted-foreground">{node.period}</div>
                  <div className="mt-3 min-h-12 text-sm font-semibold leading-6">{node.title}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="status-chip">{String(index + 1).padStart(2, "0")}</span>
                    <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="page-panel rounded-lg p-5">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-xl font-semibold">AI 导师 / 反方委员</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              选择角色、关联知识节点或公司，把“我觉得”变成可追问的假设。
            </p>
            <div className="mt-4 grid gap-2">
              {["导师解释", "反方质询", "考官追问", "研究整理"].map((item, index) => (
                <Link
                  key={item}
                  href="/mentor"
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:border-primary hover:bg-muted"
                >
                  <span>{item}</span>
                  <span className={index === 1 ? "status-chip status-chip-warn" : "status-chip"}>AI</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="page-panel rounded-lg p-5">
            <h2 className="text-xl font-semibold">观察池状态</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {watchStatuses.map((status, index) => (
                <span key={status} className={index === 2 ? "status-chip status-chip-warn" : "status-chip status-chip-primary"}>
                  {status}
                </span>
              ))}
            </div>
          </div>

          <div className="page-panel rounded-lg p-5">
            <h2 className="text-xl font-semibold">下一步待办</h2>
            <div className="mt-4 space-y-3">
              {nextActions.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="text-sm leading-6 text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="page-panel rounded-lg p-6">
        <SectionHeader
          title="核心能力"
          description="先把学习、估值、纪律和复盘做成一套能持续运转的系统。"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="rounded-lg border border-border bg-background p-5 transition hover:border-primary hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" aria-hidden />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
