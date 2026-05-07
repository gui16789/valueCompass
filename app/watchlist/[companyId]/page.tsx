import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LinkIcon,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { PendingButton } from "@/components/ui/pending-button";
import type { checklistRuns, companies, companyResearchSources, decisions, valuations } from "@/db/schema";
import type { ValuationResult } from "@/lib/valuations/calculations";
import { checklistTypes, labelFor as labelForChecklist } from "@/lib/investment-system/constants";
import { getTemplate } from "@/lib/valuations/constants";
import {
  companyTypes,
  exchanges,
  labelFor,
  researchSourceTypes,
  sourceVerificationStatuses,
  valuationStatuses,
  watchStatuses
} from "@/lib/watchlist/constants";
import { getCompanyResearchPageData } from "@/lib/watchlist/queries";
import {
  addResearchSource,
  archiveResearchSource,
  updateCompany,
  updateResearchSourceStatus
} from "../actions";

type Company = typeof companies.$inferSelect;
type Source = typeof companyResearchSources.$inferSelect;
type Valuation = typeof valuations.$inferSelect;
type ChecklistRun = typeof checklistRuns.$inferSelect;
type Decision = typeof decisions.$inferSelect;

type CompanyResearchPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CompanyResearchPage({ params }: CompanyResearchPageProps) {
  const { companyId } = await params;
  const { company, sources, valuations: valuationRows, checklistRuns: runRows, decisions: decisionRows } =
    await getCompanyResearchPageData(companyId);

  if (!company) {
    notFound();
  }

  const researchDraft = `请作为 A 股研究助理，帮我审阅 ${company.stockName}（${company.stockCode}）的研究档案。请区分事实、推断、观点和待确认事项，不要给买入或卖出建议。当前研究：商业简介=${company.description || "未填写"}；投资假设=${company.thesis || "未填写"}；关键风险=${company.keyRisks || "未填写"}；下一步=${company.nextAction || "未填写"}。`;
  const opponentDraft = `请作为投资委员会反方委员，质疑我对 ${company.stockName}（${company.stockCode}）的研究档案。不要给买入卖出建议，只提出反方问题、遗漏证据和原则冲突。我的投资假设=${company.thesis || "未填写"}；关键风险=${company.keyRisks || "未填写"}；资料来源数量=${sources.length}。`;

  return (
    <main className="space-y-6">
      <Link
        href="/watchlist"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回观察池
      </Link>

      <section className="hero-panel rounded-lg p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
              <span>{company.stockCode}</span>
              <span>/</span>
              <span>{labelFor(exchanges, company.exchange)}</span>
              <span>/</span>
              <span>{labelFor(companyTypes, company.companyType)}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">{company.stockName} 研究档案</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              {company.description || "先补充这家公司靠什么赚钱、行业位置和最重要的验证问题。"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label={labelFor(watchStatuses, company.watchStatus)} />
            <StatusPill label={labelFor(valuationStatuses, company.valuationStatus)} />
            <StatusPill label={company.inCircle ? "能力圈内" : "能力圈外/待确认"} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <ResearchOverview company={company} />
          <ResearchSourcesPanel company={company} sources={sources} />
          <ValuationHistory valuations={valuationRows} />
          <DecisionHistory checklistRuns={runRows} decisions={decisionRows} />
        </div>

        <aside className="space-y-6">
          <ActionPanel company={company} researchDraft={researchDraft} opponentDraft={opponentDraft} />
          <EditCompanyPanel company={company} />
          <AddSourcePanel company={company} />
        </aside>
      </section>
    </main>
  );
}

function ResearchOverview({ company }: { company: Company }) {
  return (
    <section className="page-panel rounded-lg p-5">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">研究摘要</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <InfoBlock title="投资假设" value={company.thesis || "未填写"} />
        <InfoBlock title="关键风险" value={company.keyRisks || "未填写"} />
        <InfoBlock title="下一步行动" value={company.nextAction || "未填写"} />
      </div>
    </section>
  );
}

function ResearchSourcesPanel({ company, sources }: { company: Company; sources: Source[] }) {
  return (
    <section className="page-panel rounded-lg p-5">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">资料来源</h2>
      </div>
      {sources.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          还没有资料来源。建议先保存年报、公告、手动研究笔记或 AI 提取后由你确认的关键证据。
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {sources.map((source) => (
            <article key={source.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
                    <span>{labelFor(researchSourceTypes, source.sourceType)}</span>
                    <span>/</span>
                    <span>{labelFor(sourceVerificationStatuses, source.verificationStatus)}</span>
                    {source.sourceDate ? (
                      <>
                        <span>/</span>
                        <span>{source.sourceDate}</span>
                      </>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-semibold">{source.title}</h3>
                  {source.sourceName ? (
                    <p className="mt-1 text-xs text-muted-foreground">来源：{source.sourceName}</p>
                  ) : null}
                </div>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    <LinkIcon className="h-4 w-4" aria-hidden />
                    打开来源
                  </a>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <InfoBlock title="关键摘录" value={source.excerpt || "未填写"} />
                <InfoBlock title="研究要点" value={source.keyPoints || "未填写"} />
              </div>
              {source.notes ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">备注：{source.notes}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <SourceStatusForm companyId={company.id} source={source} status="confirmed" label="标记已确认" />
                <SourceStatusForm companyId={company.id} source={source} status="needs_review" label="标记待复核" />
                <ArchiveSourceForm companyId={company.id} source={source} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ValuationHistory({ valuations }: { valuations: Valuation[] }) {
  return (
    <section className="page-panel rounded-lg p-5">
      <h2 className="text-xl font-semibold">估值记录</h2>
      {valuations.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">还没有估值记录。可以从右侧进入估值工具创建三情景估值。</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {valuations.map((valuation) => {
            const result = parseValuationResult(valuation.resultJson);
            return (
              <div key={valuation.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold text-primary">
                      {getTemplate(valuation.templateType).label} / {valuation.valuationDate}
                    </div>
                    <h3 className="mt-1 font-semibold">{valuation.title}</h3>
                  </div>
                  <div className="text-sm font-semibold">
                    {result ? `${formatNumber(result.lowValuePerShare)} - ${formatNumber(result.highValuePerShare)} 元/股` : "暂无结果"}
                  </div>
                </div>
                {result ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    中性估值 {formatNumber(result.baseValuePerShare)} 元/股，安全边际 {formatPercent(result.baseMarginOfSafety)}。
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DecisionHistory({ checklistRuns, decisions }: { checklistRuns: ChecklistRun[]; decisions: Decision[] }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="page-panel rounded-lg p-5">
        <h2 className="text-xl font-semibold">检查记录</h2>
        <div className="mt-4 space-y-3">
          {checklistRuns.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">暂无检查记录。</p>
          ) : (
            checklistRuns.map((run) => (
              <div key={run.id} className="rounded-md border border-border bg-background p-3">
                <div className="text-xs font-semibold text-primary">{labelForChecklist(checklistTypes, run.checklistType)}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{run.summary || run.finalJudgment}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="page-panel rounded-lg p-5">
        <h2 className="text-xl font-semibold">决策记录</h2>
        <div className="mt-4 space-y-3">
          {decisions.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">暂无决策记录。</p>
          ) : (
            decisions.map((decision) => (
              <div key={decision.id} className="rounded-md border border-border bg-background p-3">
                <div className="text-xs font-semibold text-primary">{decision.decisionDate}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{decision.finalUserJudgment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ActionPanel({
  company,
  researchDraft,
  opponentDraft
}: {
  company: Company;
  researchDraft: string;
  opponentDraft: string;
}) {
  return (
    <section className="page-panel rounded-lg p-5">
      <h2 className="font-semibold">下一步</h2>
      <div className="mt-3 grid gap-2">
        <Link
          href={`/mentor?role=research_assistant&draft=${encodeURIComponent(researchDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <Bot className="h-4 w-4" aria-hidden />
          问研究助理
        </Link>
        <Link
          href={`/mentor?role=opponent&draft=${encodeURIComponent(opponentDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          反方质询档案
        </Link>
        <Link
          href={`/valuations?companyId=${company.id}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          创建估值
        </Link>
        <Link
          href={`/system?companyId=${company.id}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          运行检查清单
        </Link>
      </div>
    </section>
  );
}

function EditCompanyPanel({ company }: { company: Company }) {
  return (
    <details className="page-panel rounded-lg p-5">
      <summary className="cursor-pointer font-semibold">编辑研究档案</summary>
      <form action={updateCompany} className="mt-4 space-y-4">
        <input type="hidden" name="companyId" value={company.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="股票代码" name="stockCode" defaultValue={company.stockCode} />
          <Field label="公司名称" name="stockName" defaultValue={company.stockName} />
          <SelectField label="交易所" name="exchange" options={exchanges} defaultValue={company.exchange} />
          <Field label="行业" name="industry" defaultValue={company.industry} />
          <SelectField label="公司类型" name="companyType" options={companyTypes} defaultValue={company.companyType} />
          <SelectField label="研究状态" name="watchStatus" options={watchStatuses} defaultValue={company.watchStatus} />
          <SelectField label="估值状态" name="valuationStatus" options={valuationStatuses} defaultValue={company.valuationStatus} />
          <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
            <input name="inCircle" type="checkbox" defaultChecked={company.inCircle} />
            在我的能力圈内
          </label>
        </div>
        <TextArea label="公司简介" name="description" defaultValue={company.description} rows={3} />
        <TextArea label="投资假设" name="thesis" defaultValue={company.thesis} rows={3} />
        <TextArea label="关键风险" name="keyRisks" defaultValue={company.keyRisks} rows={3} />
        <TextArea label="下一步行动" name="nextAction" defaultValue={company.nextAction} rows={2} />
        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="保存中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          保存档案
        </PendingButton>
      </form>
    </details>
  );
}

function AddSourcePanel({ company }: { company: Company }) {
  return (
    <details className="page-panel rounded-lg p-5" open>
      <summary className="cursor-pointer font-semibold">新增资料来源</summary>
      <form action={addResearchSource} className="mt-4 space-y-4">
        <input type="hidden" name="companyId" value={company.id} />
        <Field label="资料标题" name="title" placeholder="例如：2024 年报经营摘要" />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="资料类型" name="sourceType" options={researchSourceTypes} defaultValue="manual_note" />
          <SelectField label="确认状态" name="verificationStatus" options={sourceVerificationStatuses} defaultValue="pending" />
          <Field label="来源名称" name="sourceName" placeholder="例如：公司公告 / 年报 / 手动笔记" />
          <Field label="资料日期" name="sourceDate" type="date" />
        </div>
        <Field label="来源链接" name="url" placeholder="可选，公告或资料链接" />
        <TextArea label="关键摘录" name="excerpt" rows={4} />
        <TextArea label="研究要点" name="keyPoints" rows={4} />
        <TextArea label="备注" name="notes" rows={2} />
        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="保存中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          保存资料
        </PendingButton>
      </form>
    </details>
  );
}

function SourceStatusForm({
  companyId,
  source,
  status,
  label
}: {
  companyId: string;
  source: Source;
  status: string;
  label: string;
}) {
  return (
    <form action={updateResearchSourceStatus}>
      <input type="hidden" name="sourceId" value={source.id} />
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="verificationStatus" value={status} />
      <PendingButton
        disabled={source.verificationStatus === status}
        className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
        pendingChildren="保存中"
      >
        {label}
      </PendingButton>
    </form>
  );
}

function ArchiveSourceForm({ companyId, source }: { companyId: string; source: Source }) {
  return (
    <details className="rounded-md border border-border bg-card px-3 py-2">
      <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">归档</summary>
      <form action={archiveResearchSource} className="mt-3 space-y-2">
        <input type="hidden" name="sourceId" value={source.id} />
        <input type="hidden" name="companyId" value={companyId} />
        <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <input name="confirmArchive" type="checkbox" className="mt-1" />
          我确认将这条资料从当前档案中归档
        </label>
        <PendingButton
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
          pendingChildren="归档中"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          确认归档
        </PendingButton>
      </form>
    </details>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  placeholder = "",
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue = "",
  rows
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
      />
    </label>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="status-chip">
      {label}
    </span>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs font-semibold text-primary">{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function parseValuationResult(value: string): ValuationResult | null {
  try {
    const parsed = JSON.parse(value) as Partial<ValuationResult>;

    if (
      typeof parsed.lowValuePerShare === "number" &&
      typeof parsed.baseValuePerShare === "number" &&
      typeof parsed.highValuePerShare === "number"
    ) {
      return parsed as ValuationResult;
    }

    return null;
  } catch {
    return null;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}
