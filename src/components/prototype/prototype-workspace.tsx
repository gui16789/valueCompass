import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  FileText,
  LineChart,
  MessageSquareQuote,
  ShieldQuestion
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const metrics = [
  { label: "学习进度", value: "18%", detail: "已完成 7 / 40 个节点", icon: BookOpen },
  { label: "观察池", value: "12", detail: "3 家等待估值更新", icon: Database },
  { label: "待检查", value: "3", detail: "买入 1 · 不操作 2", icon: ClipboardCheck },
  { label: "待复盘", value: "2", detail: "本周需要回看假设", icon: FileText }
];

const timelineNodes = [
  "格雷厄姆",
  "巴菲特早期",
  "芒格",
  "费雪",
  "彼得·林奇",
  "卡拉曼",
  "A 股本土化"
];

const watchlistRows = [
  ["600519", "贵州茅台", "消费", "深入研究", "等待价格"],
  ["600036", "招商银行", "金融", "观察中", "需重估"],
  ["601899", "紫金矿业", "周期", "观察中", "看周期位置"],
  ["300750", "宁德时代", "制造", "深研", "检查资本开支"]
];

const todos = [
  "完成“安全边际”概念测验",
  "更新消费股模板的中性情景",
  "让反方委员质疑制造业估值假设",
  "复盘上一条不操作决策"
];

const valuationRows = [
  ["金融股", "PB-ROE", "ROE、PB、不良率、拨备"],
  ["周期股", "归一化 PE", "中枢利润、商品价格、负债"],
  ["消费股", "PE 情景", "增长、毛利率、现金流"],
  ["制造业", "DCF + PE", "研发、资本开支、存货应收"]
];

export function PrototypeWorkspace() {
  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">低保真浏览器原型</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">价值投资工作台</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            这个页面用于评审信息架构和页面密度：学习、AI、观察池、估值、检查清单和复盘应在同一套工作流中互相连接。
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          <div className="font-semibold">模型状态</div>
          <div className="mt-1 text-muted-foreground">OpenAI API 兼容模型待配置</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="mt-4 text-3xl font-semibold">{metric.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{metric.detail}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="学习地图" description="时间线和学派地图负责组织经典体系。" />
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {timelineNodes.map((node, index) => (
              <div key={node} className="min-w-36 rounded-lg border border-border bg-background p-4">
                <div className="text-xs font-semibold text-muted-foreground">节点 {index + 1}</div>
                <div className="mt-2 text-sm font-semibold">{node}</div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${30 + index * 8}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="AI 导师" description="角色明确，避免普通聊天框化。" />
          <div className="mt-5 grid gap-3">
            <RoleRow icon={Bot} title="耐心导师" detail="解释概念、原著和估值参数" />
            <RoleRow icon={ShieldQuestion} title="反方委员" detail="质疑买卖理由和估值假设" />
            <RoleRow icon={MessageSquareQuote} title="考官" detail="通过追问检验概念掌握度" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="A 股观察池" description="以研究状态和下一步行动组织公司。" />
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">代码</th>
                  <th className="px-4 py-3 font-medium">公司</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">下一步</th>
                </tr>
              </thead>
              <tbody>
                {watchlistRows.map((row) => (
                  <tr key={row[0]} className="border-t border-border">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="下一步待办" description="系统推动流程，但不替用户决策。" />
          <div className="mt-5 space-y-3">
            {todos.map((todo) => (
              <div key={todo} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm">{todo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="估值模板" description="简化模式默认展示，高级字段折叠。" />
          <div className="mt-5 grid gap-3">
            {valuationRows.map(([type, model, fields]) => (
              <div key={type} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-primary" aria-hidden />
                  <span className="font-semibold">{type}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{model}</div>
                <div className="mt-1 text-xs text-muted-foreground">{fields}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="决策检查" description="买入、卖出、不操作必须同等重要。" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <DecisionCard title="买入检查" detail="好公司、好价格、安全边际、反面证据" />
            <DecisionCard title="卖出检查" detail="基本面恶化、估值过高、判断错误" />
            <DecisionCard title="不操作检查" detail="证据不足、价格不够好、情绪驱动" />
          </div>
          <div className="mt-5 rounded-lg border border-border bg-muted p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden />
              输出边界
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              估值和 AI 审阅只输出区间、假设、风险和清单匹配情况，不输出买入建议。最终判断由用户写入决策日志。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function RoleRow({
  icon: Icon,
  title,
  detail
}: {
  icon: typeof Bot;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
      <Icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function DecisionCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <CircleDollarSign className="h-4 w-4 text-primary" aria-hidden />
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</div>
    </div>
  );
}
