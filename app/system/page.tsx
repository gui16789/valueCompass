import Link from "next/link";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FilePenLine,
  History,
  ShieldAlert
} from "lucide-react";
import { ChecklistTemplateEditor } from "@/components/system/checklist-template-editor";
import { PendingButton } from "@/components/ui/pending-button";
import { SectionHeader } from "@/components/ui/section-header";
import type { checklistRuns, companies, decisions, investmentPrinciples } from "@/db/schema";
import {
  checklistStatuses,
  checklistTypes,
  labelFor,
  type EffectiveChecklistTemplate,
  type ChecklistTemplateItem,
  type ChecklistType
} from "@/lib/investment-system/constants";
import { getSystemPageData } from "@/lib/investment-system/queries";
import { saveChecklistRun, saveChecklistTemplate, saveInvestmentPrinciple } from "./actions";

type SystemPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

type Company = typeof companies.$inferSelect;
type Principle = typeof investmentPrinciples.$inferSelect;
type Run = typeof checklistRuns.$inferSelect;
type Decision = typeof decisions.$inferSelect;

type RunItem = ChecklistTemplateItem & {
  status: string;
  note: string;
};

export default async function SystemPage({ searchParams }: SystemPageProps) {
  const paramsPromise: Promise<{ status?: string; message?: string }> = searchParams ?? Promise.resolve({});
  const [params, data] = await Promise.all([paramsPromise, getSystemPageData()]);

  return (
    <main className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            title="投资系统"
            description="把你的原则、清单和最终判断固定成流程：先检查，再记录，最后复盘。AI 只负责追问和反驳，不替你做买卖结论。"
          />
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3 text-center">
            <Metric label="原则" value={data.principle ? 1 : 0} />
            <Metric label="检查" value={data.recentRuns.length} />
            <Metric label="决策" value={data.recentDecisions.length} />
          </div>
        </div>
      </section>

      {params.message ? (
        <StatusBanner status={params.status === "success" ? "success" : "error"} message={params.message} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PrinciplePanel principle={data.principle} />
        <ChecklistPanel
          principle={data.principle}
          companies={data.companies}
          templates={data.checklistTemplates}
        />
      </section>

      <ChecklistTemplateEditor templates={data.checklistTemplates} saveAction={saveChecklistTemplate} />

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentRuns runs={data.recentRuns} principle={data.principle} />
        <DecisionLog decisions={data.recentDecisions} />
      </section>
    </main>
  );
}

function PrinciplePanel({ principle }: { principle?: Principle }) {
  const auditDraft = `请作为投资委员会反方委员，检查我的 A 股价值投资原则是否足够清晰、可执行、可反证。不要替我制定最终原则，也不要给买卖建议。我的原则如下：能力圈=${principle?.circleOfCompetence || "未填写"}；不碰行业=${principle?.excludedIndustries || "未填写"}；财务质量=${principle?.minimumFinancialQuality || "未填写"}；安全边际=${principle?.minimumMarginOfSafety || "未填写"}；买入规则=${principle?.buyRules || "未填写"}；卖出规则=${principle?.sellRules || "未填写"}；不操作规则=${principle?.doNothingRules || "未填写"}。`;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2">
          <FilePenLine className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">投资原则</h2>
        </div>
        <Link
          href={`/mentor?role=opponent&draft=${encodeURIComponent(auditDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          让反方委员检查原则
        </Link>
      </div>

      <form action={saveInvestmentPrinciple} className="mt-5 space-y-4">
        {principle ? <input type="hidden" name="principleId" value={principle.id} /> : null}
        <Field label="原则名称" name="title" defaultValue={principle?.title ?? "我的 A 股价值投资原则"} />
        <TextArea label="能力圈" name="circleOfCompetence" defaultValue={principle?.circleOfCompetence} placeholder="我能理解哪些行业、商业模式和财务指标？哪些暂时看不懂？" />
        <TextArea label="不碰行业 / 情形" name="excludedIndustries" defaultValue={principle?.excludedIndustries} placeholder="例如：看不懂的高杠杆、治理差、财报质量不可信、商业模式快速变化等。" />
        <TextArea label="财务质量底线" name="minimumFinancialQuality" defaultValue={principle?.minimumFinancialQuality} placeholder="例如：现金流、负债率、ROE 稳定性、应收账款、资本开支等底线。" />
        <TextArea label="安全边际要求" name="minimumMarginOfSafety" defaultValue={principle?.minimumMarginOfSafety} placeholder="不同类型公司需要多大折扣、哪些假设必须保守？" />
        <TextArea label="仓位规则" name="positionRules" defaultValue={principle?.positionRules} placeholder="单家公司、单一行业、现金比例和加减仓约束。" />
        <div className="grid gap-4 md:grid-cols-3">
          <TextArea label="买入规则" name="buyRules" defaultValue={principle?.buyRules} placeholder="什么条件都满足后才允许进入下一步？" />
          <TextArea label="卖出规则" name="sellRules" defaultValue={principle?.sellRules} placeholder="假设破裂、基本面恶化、估值过高或更好机会如何处理？" />
          <TextArea label="不操作规则" name="doNothingRules" defaultValue={principle?.doNothingRules} placeholder="什么情况下继续观察、等待价格或补证据？" />
        </div>
        <TextArea label="风险规则" name="riskRules" defaultValue={principle?.riskRules} placeholder="哪些风险必须写清？哪些风险一出现就暂停决策？" />

        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="保存中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          保存投资原则
        </PendingButton>
      </form>
    </section>
  );
}

function ChecklistPanel({
  principle,
  companies,
  templates
}: {
  principle?: Principle;
  companies: Company[];
  templates: Record<ChecklistType, EffectiveChecklistTemplate>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">决策检查清单</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        选择一家公司，完成买入、卖出或不操作检查。最终判断必须由你填写，系统只记录流程证据。
      </p>

      {!principle ? (
        <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          建议先保存投资原则，再运行检查清单。MVP 允许先跑清单，但原则缺失会降低复盘质量。
        </div>
      ) : null}

      <div className="mt-5 space-y-5">
        {checklistTypes.map((type) => (
          <ChecklistForm
            key={type.value}
            type={type.value as ChecklistType}
            companies={companies}
            template={templates[type.value as ChecklistType]}
          />
        ))}
      </div>
    </section>
  );
}

function ChecklistForm({
  type,
  companies,
  template
}: {
  type: ChecklistType;
  companies: Company[];
  template: EffectiveChecklistTemplate;
}) {
  const typeMeta = checklistTypes.find((item) => item.value === type);

  return (
    <details className="rounded-lg border border-border bg-background p-4" open={type === "buy"}>
      <summary className="cursor-pointer text-sm font-semibold">
        {typeMeta?.label ?? type}
        <span className="ml-2 text-xs text-muted-foreground">
          {template.isCustom ? "自定义模板" : "默认模板"} / {template.items.length} 项
        </span>
      </summary>
      <form action={saveChecklistRun} className="mt-4 space-y-4">
        <input type="hidden" name="checklistType" value={type} />
        <label className="block">
          <span className="text-sm font-semibold">关联公司</span>
          <select
            name="companyId"
            className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
          >
            <option value="">不关联公司</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.stockName}（{company.stockCode}）
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3">
          {template.items.map((item) => (
            <ChecklistItem key={item.id} item={item} />
          ))}
        </div>

        <TextArea label="关键假设" name="keyAssumptions" placeholder="写下这次判断最依赖的 1-3 个假设。" />
        <TextArea label="主要风险" name="risks" placeholder="写下最可能推翻这次判断的风险。" />
        <TextArea label="检查摘要" name="summary" placeholder="可选：概括这次检查的核心结论和未确认事项。" />
        <TextArea label={typeMeta?.decisionLabel ?? "用户最终判断"} name="finalJudgment" placeholder="必须由你自己填写，例如：继续研究、等待价格、排除、纳入候选等。不需要写买卖建议。" />

        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="保存中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          保存检查和决策记录
        </PendingButton>
      </form>
    </details>
  );
}

function ChecklistItem({ item }: { item: ChecklistTemplateItem }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
            <span>{item.category}</span>
            {item.required ? <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">关键项</span> : null}
          </div>
          <p className="mt-2 text-sm leading-6">{item.text}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {checklistStatuses.map((status) => (
            <label key={status.value} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1">
              <input
                type="radio"
                name={`status.${item.id}`}
                value={status.value}
                defaultChecked={status.value === "unknown"}
              />
              {status.label}
            </label>
          ))}
        </div>
      </div>
      <input
        name={`note.${item.id}`}
        placeholder="备注：证据、反例或待确认事项"
        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </div>
  );
}

function RecentRuns({
  runs,
  principle
}: {
  runs: Array<{ run: Run; company: Company | null }>;
  principle?: Principle;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">最近检查</h2>
      </div>
      <div className="mt-5 space-y-3">
        {runs.length === 0 ? (
          <EmptyState text="还没有检查记录。先完成一次买入、卖出或不操作检查。" />
        ) : (
          runs.map(({ run, company }) => (
            <RunCard key={run.id} run={run} company={company} principle={principle} />
          ))
        )}
      </div>
    </section>
  );
}

function RunCard({ run, company, principle }: { run: Run; company: Company | null; principle?: Principle }) {
  const items = parseRunItems(run.itemsJson);
  const issueCount = items.filter((item) => item.required && (item.status === "fail" || item.status === "unknown")).length;
  const opponentDraft = `请作为投资委员会反方委员，审阅我的${labelFor(checklistTypes, run.checklistType)}记录。不要给买入或卖出建议，只提出反方问题、遗漏证据和原则冲突。公司=${company ? `${company.stockName}（${company.stockCode}）` : "未关联"}；检查摘要=${run.summary}；最终判断=${run.finalJudgment}；当前原则=${principle?.title || "未保存原则"}。检查项=${items.map((item) => `${item.text}：${labelFor(checklistStatuses, item.status)}${item.note ? `，备注：${item.note}` : ""}`).join("；")}`;

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold">{labelFor(checklistTypes, run.checklistType)}</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {company ? `${company.stockName}（${company.stockCode}）` : "未关联公司"} / {run.createdAt.slice(0, 10)}
          </p>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          关键问题 {issueCount} 项
        </span>
      </div>
      <p className="mt-3 text-sm leading-6">{run.summary}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">最终判断：{run.finalJudgment}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.slice(0, 4).map((item) => (
          <span key={item.id} className="rounded-full border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
            {item.category}：{labelFor(checklistStatuses, item.status)}
          </span>
        ))}
      </div>
      <Link
        href={`/mentor?role=opponent&draft=${encodeURIComponent(opponentDraft)}`}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
      >
        <Bot className="h-4 w-4" aria-hidden />
        请求反方审阅
      </Link>
    </article>
  );
}

function DecisionLog({ decisions }: { decisions: Array<{ decision: Decision; company: Company | null }> }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">决策日志</h2>
      </div>
      <div className="mt-5 space-y-3">
        {decisions.length === 0 ? (
          <EmptyState text="还没有决策日志。完成检查清单后会自动生成一条用户判断记录。" />
        ) : (
          decisions.map(({ decision, company }) => (
            <article key={decision.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold">{labelFor(checklistTypes, decision.decisionType)}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {company ? `${company.stockName}（${company.stockCode}）` : "未关联公司"} / {decision.decisionDate}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                  用户填写
                </span>
              </div>
              <p className="mt-3 text-sm leading-6">{decision.finalUserJudgment}</p>
              {decision.keyAssumptions || decision.risks ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <InfoBlock title="关键假设" value={decision.keyAssumptions || "未填写"} />
                  <InfoBlock title="主要风险" value={decision.risks || "未填写"} />
                </div>
              ) : null}
              <Link
                href={`/reviews/decisions/${decision.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                <FileText className="h-4 w-4" aria-hidden />
                查看决策详情
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function Field({ label, name, defaultValue = "" }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue = "",
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
      />
    </label>
  );
}

function StatusBanner({ status, message }: { status: "success" | "error"; message: string }) {
  const Icon = status === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
        <p className="text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs font-semibold text-primary">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
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

function parseRunItems(value: string): RunItem[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
