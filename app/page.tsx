import { ArrowRight, BookOpen, Brain, LineChart, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const timeline = [
  "格雷厄姆与多德",
  "巴菲特早期",
  "巴菲特与芒格",
  "费雪成长股",
  "彼得·林奇",
  "卡拉曼安全边际",
  "A 股本土化"
];

const modules = [
  {
    title: "学习地图",
    description: "从经典学派到 A 股案例，补齐价值投资底层框架。",
    icon: BookOpen
  },
  {
    title: "AI 导师",
    description: "既能耐心讲清概念，也会追问你的假设和漏洞。",
    icon: Brain
  },
  {
    title: "估值工具",
    description: "用四类 A 股模板，把价格、假设和安全边际算明白。",
    icon: LineChart
  },
  {
    title: "投资纪律",
    description: "用原则、清单、日志和复盘，减少情绪化决策。",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <main className="space-y-10">
      <section className="rounded-lg border border-border bg-card p-8">
        <p className="text-sm font-semibold text-primary">A 股价值投资 · AI 导师陪练 · 本地自运行</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-foreground">
          从 0 搭建自己的自运行投资系统
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          把碎片化学习、公司研究、估值判断、买卖纪律和复盘改进串成一条流程，让你不再靠感觉做 A 股投资决策。
        </p>
      </section>

      <section>
        <SectionHeader
          title="价值投资时间线"
          description="沿着经典学派、关键人物和 A 股本土案例，建立自己的价值投资知识地图。"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-7">
          {timeline.map((item, index) => (
            <div key={item} className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">0{index + 1}</div>
              <div className="mt-2 text-sm font-semibold">{item}</div>
              {index < timeline.length - 1 ? (
                <ArrowRight className="mt-4 h-4 w-4 text-primary" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="核心能力" description="先把学习、估值、纪律和复盘做成一套能持续运转的系统。" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.title} className="rounded-lg border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="mt-4 text-lg font-semibold">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
