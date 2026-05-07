import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Calculator,
  ClipboardCheck,
  FileText,
  RotateCcw,
  ShieldAlert
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { checklistRuns, investmentPrinciples, reviews, valuations } from "@/db/schema";
import {
  checklistStatuses,
  checklistTypes,
  labelFor as checklistLabelFor
} from "@/lib/investment-system/constants";
import { getDecisionDetailData } from "@/lib/reviews/queries";
import { labelFor as reviewLabelFor, reviewTypes } from "@/lib/reviews/constants";
import { getTemplate } from "@/lib/valuations/constants";
import type { ValuationResult } from "@/lib/valuations/calculations";

type DecisionDetailPageProps = {
  params: Promise<{
    decisionId: string;
  }>;
};

type ChecklistRun = typeof checklistRuns.$inferSelect;
type Principle = typeof investmentPrinciples.$inferSelect;
type Review = typeof reviews.$inferSelect;
type Valuation = typeof valuations.$inferSelect;

type ChecklistRunItem = {
  id: string;
  text: string;
  category: string;
  required: boolean;
  status: string;
  note: string;
};

export const dynamic = "force-dynamic";

export default async function DecisionDetailPage({ params }: DecisionDetailPageProps) {
  const { decisionId } = await params;
  const data = await getDecisionDetailData(decisionId);

  if (!data) {
    notFound();
  }

  const { decision, company, checklistRun, principle, reviews, valuations } = data;
  const companyName = company ? `${company.stockName}（${company.stockCode}）` : "未关联公司";
  const mentorDraft = `请作为耐心的价值投资导师，帮我复盘这条 A 股投资决策记录。不要给买入、卖出或持有建议，只帮助我检查假设、证据、风险和后续学习方向。公司=${companyName}；用户最终判断=${decision.finalUserJudgment}；关键假设=${decision.keyAssumptions || "未填写"}；主要风险=${decision.risks || "未填写"}；已有复盘=${reviews.map((review) => `${review.reviewDate}：${review.lessons}`).join("；") || "暂无"}。`;
  const opponentDraft = `请作为投资委员会反方委员，质疑这条 A 股投资决策记录。不要给买入、卖出或持有建议，只指出反方问题、遗漏证据、原则冲突和可能的归因错误。公司=${companyName}；用户最终判断=${decision.finalUserJudgment}；关键假设=${decision.keyAssumptions || "未填写"}；主要风险=${decision.risks || "未填写"}；检查摘要=${checklistRun?.summary || "未关联检查清单"}。`;

  return (
    <main className="space-y-8">
      <Link
        href="/reviews"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回复盘
      </Link>

      <section className="hero-panel rounded-lg p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            title="决策详情"
            description="回看这次判断的证据链：公司、检查清单、关键假设、主要风险、关联原则、估值记录和后续复盘。"
          />
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card/80 p-3 text-center">
            <Metric label="日期" value={decision.decisionDate} />
            <Metric label="类型" value={checklistLabelFor(checklistTypes, decision.decisionType)} />
            <Metric label="复盘" value={`${reviews.length} 条`} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <DecisionSnapshot
            companyName={companyName}
            decisionType={decision.decisionType}
            decisionDate={decision.decisionDate}
            finalUserJudgment={decision.finalUserJudgment}
            keyAssumptions={decision.keyAssumptions}
            risks={decision.risks}
          />
          <ChecklistEvidence checklistRun={checklistRun} />
          <ReviewHistory reviews={reviews} />
        </div>

        <div className="space-y-6">
          <ActionPanel decisionId={decision.id} mentorDraft={mentorDraft} opponentDraft={opponentDraft} />
          <PrincipleSnapshot principle={principle} />
          <RelatedValuations valuations={valuations} />
        </div>
      </section>
    </main>
  );
}

function DecisionSnapshot({
  companyName,
  decisionType,
  decisionDate,
  finalUserJudgment,
  keyAssumptions,
  risks
}: {
  companyName: string;
  decisionType: string;
  decisionDate: string;
  finalUserJudgment: string;
  keyAssumptions: string;
  risks: string;
}) {
  return (
    <section className="page-panel rounded-lg p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">用户决策记录</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <InfoBlock title="公司" value={companyName} />
        <InfoBlock title="决策类型" value={checklistLabelFor(checklistTypes, decisionType)} />
        <InfoBlock title="决策日期" value={decisionDate} />
      </div>
      <div className="mt-4 rounded-md border border-border bg-background p-4">
        <div className="text-xs font-semibold text-primary">最终判断</div>
        <p className="mt-2 text-sm leading-6">{finalUserJudgment}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoBlock title="关键假设" value={keyAssumptions || "未填写"} />
        <InfoBlock title="主要风险" value={risks || "未填写"} />
      </div>
    </section>
  );
}

function ChecklistEvidence({ checklistRun }: { checklistRun: ChecklistRun | null }) {
  const items = checklistRun ? parseChecklistItems(checklistRun.itemsJson) : [];
  const issueCount = items.filter((item) => item.required && (item.status === "fail" || item.status === "unknown")).length;

  return (
    <section className="page-panel rounded-lg p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">检查清单证据</h2>
        </div>
        {checklistRun ? (
          <span className="status-chip">
            关键未确认/失败 {issueCount} 项
          </span>
        ) : null}
      </div>

      {!checklistRun ? (
        <EmptyState text="这条决策没有关联检查清单。后续建议从投资系统页面通过检查清单生成决策。" />
      ) : (
        <div className="mt-5 space-y-3">
          <InfoBlock title="检查摘要" value={checklistRun.summary || "未填写"} />
          {items.map((item) => (
            <article key={item.id} className="rounded-md border border-border bg-background p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
                    <span>{item.category}</span>
                    {item.required ? <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">关键项</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6">{item.text}</p>
                </div>
                <span className="status-chip">
                  {checklistLabelFor(checklistStatuses, item.status)}
                </span>
              </div>
              {item.note ? <p className="mt-3 text-sm leading-6 text-muted-foreground">备注：{item.note}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ActionPanel({
  decisionId,
  mentorDraft,
  opponentDraft
}: {
  decisionId: string;
  mentorDraft: string;
  opponentDraft: string;
}) {
  return (
    <section className="page-panel rounded-lg p-6">
      <h2 className="text-xl font-semibold">下一步动作</h2>
      <div className="mt-5 grid gap-3">
        <Link
          href={`/reviews?decisionId=${decisionId}#review-form`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          创建这条决策的复盘
        </Link>
        <Link
          href={`/mentor?role=mentor&draft=${encodeURIComponent(mentorDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <Bot className="h-4 w-4" aria-hidden />
          让导师总结
        </Link>
        <Link
          href={`/mentor?role=opponent&draft=${encodeURIComponent(opponentDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          让反方委员追问
        </Link>
      </div>
    </section>
  );
}

function PrincipleSnapshot({ principle }: { principle: Principle | null }) {
  return (
    <section className="page-panel rounded-lg p-6">
      <h2 className="text-xl font-semibold">关联原则</h2>
      {!principle ? (
        <EmptyState text="这条决策没有关联投资原则。建议先在投资系统页面保存一套原则。" />
      ) : (
        <div className="mt-5 space-y-3">
          <InfoBlock title="原则名称" value={`${principle.title} / v${principle.version}`} />
          <InfoBlock title="能力圈" value={principle.circleOfCompetence || "未填写"} />
          <InfoBlock title="安全边际要求" value={principle.minimumMarginOfSafety || "未填写"} />
          <InfoBlock title="风险规则" value={principle.riskRules || "未填写"} />
        </div>
      )}
    </section>
  );
}

function RelatedValuations({ valuations }: { valuations: Valuation[] }) {
  return (
    <section className="page-panel rounded-lg p-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">相关估值</h2>
      </div>
      <div className="mt-5 space-y-3">
        {valuations.length === 0 ? (
          <EmptyState text="这家公司还没有估值记录。可以先补一条三情景估值，再回到决策详情对照假设。" />
        ) : (
          valuations.map((valuation) => {
            const template = getTemplate(valuation.templateType);
            const result = parseValuationResult(valuation.resultJson);

            return (
              <article key={valuation.id} className="rounded-md border border-border bg-background p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{valuation.title}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.label} / {valuation.valuationDate}
                    </p>
                  </div>
                  <span className="status-chip">
                    中性 {formatPrice(result?.baseValuePerShare)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  区间：{formatPrice(result?.lowValuePerShare)} - {formatPrice(result?.highValuePerShare)}；中性安全边际：
                  {formatPercent(result?.baseMarginOfSafety)}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function ReviewHistory({ reviews }: { reviews: Review[] }) {
  return (
    <section className="page-panel rounded-lg p-6">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">已关联复盘</h2>
      </div>
      <div className="mt-5 space-y-3">
        {reviews.length === 0 ? (
          <EmptyState text="还没有复盘。建议在事实变化、财报更新或情绪波动后，回到这里写一次复盘。" />
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-md border border-border bg-background p-4">
              <div className="text-sm font-semibold">
                {reviewLabelFor(reviewTypes, review.reviewType)} / {review.reviewDate}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <InfoBlock title="实际发生" value={review.whatHappened || "未填写"} />
                <InfoBlock title="经验教训" value={review.lessons || "未填写"} />
                <InfoBlock title="成立假设" value={review.assumptionsValidated || "未填写"} />
                <InfoBlock title="失败假设" value={review.assumptionsFailed || "未填写"} />
              </div>
              {review.principleChangesNeeded ? (
                <div className="mt-3 rounded-md border border-border bg-card p-3">
                  <div className="text-xs font-semibold text-primary">原则修订建议</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.principleChangesNeeded}</p>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs font-semibold text-primary">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <div className="text-sm font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function parseChecklistItems(value: string): ChecklistRunItem[] {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item): ChecklistRunItem => {
        const row = item as Partial<ChecklistRunItem>;

        return {
          id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
          text: typeof row.text === "string" ? row.text : "",
          category: typeof row.category === "string" ? row.category : "通用",
          required: Boolean(row.required),
          status: typeof row.status === "string" ? row.status : "unknown",
          note: typeof row.note === "string" ? row.note : ""
        };
      })
      .filter((item) => item.text);
  } catch {
    return [];
  }
}

function parseValuationResult(value: string): ValuationResult | null {
  try {
    return JSON.parse(value) as ValuationResult;
  } catch {
    return null;
  }
}

function formatPrice(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(2)} 元` : "未计算";
}

function formatPercent(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "未计算";
}
