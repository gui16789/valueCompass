import Link from "next/link";
import {
  AlertCircle,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileText,
  History,
  RotateCcw,
  ShieldAlert
} from "lucide-react";
import { PendingButton } from "@/components/ui/pending-button";
import { SectionHeader } from "@/components/ui/section-header";
import type { companies, decisions, reviews } from "@/db/schema";
import { checklistTypes, labelFor as checklistLabelFor } from "@/lib/investment-system/constants";
import { labelFor, reviewTypes } from "@/lib/reviews/constants";
import { getReviewsPageData } from "@/lib/reviews/queries";
import { saveReview } from "./actions";

type ReviewsPageProps = {
  searchParams?: Promise<{
    decisionId?: string;
    status?: string;
    message?: string;
  }>;
};

type Company = typeof companies.$inferSelect;
type Decision = typeof decisions.$inferSelect;
type Review = typeof reviews.$inferSelect;

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const paramsPromise: Promise<{ decisionId?: string; status?: string; message?: string }> =
    searchParams ?? Promise.resolve({});
  const [params, data] = await Promise.all([paramsPromise, getReviewsPageData()]);

  return (
    <main className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            title="复盘"
            description="把每次判断放回事实里验证：哪些假设成立，哪些失败，哪些原则需要收紧。AI 只帮助总结和追问，不替你判定对错。"
          />
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3 text-center">
            <Metric label="决策" value={data.decisions.length} />
            <Metric label="复盘" value={data.reviews.length} />
            <Metric label="待复盘" value={data.pendingDecisions.length} />
          </div>
        </div>
      </section>

      {params.message ? (
        <StatusBanner status={params.status === "success" ? "success" : "error"} message={params.message} />
      ) : null}

      <PendingReviewDecisions decisions={data.pendingDecisions} />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ReviewForm decisions={data.decisions} selectedDecisionId={params.decisionId} />
        <RecentReviews reviews={data.reviews} />
      </section>
    </main>
  );
}

function PendingReviewDecisions({
  decisions
}: {
  decisions: Array<{ decision: Decision; company: Company | null }>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">待复盘决策</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          这些决策还没有关联复盘。优先回看关键假设、风险和当时检查项，再记录事实验证结果。
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {decisions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted-foreground lg:col-span-2">
            暂无待复盘决策。新的检查清单生成决策后，会出现在这里。
          </div>
        ) : (
          decisions.map(({ decision, company }) => (
            <article key={decision.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    {company ? `${company.stockName}（${company.stockCode}）` : "未关联公司"}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {decision.decisionDate} / {checklistLabelFor(checklistTypes, decision.decisionType)}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                  未复盘
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6">{decision.finalUserJudgment}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/reviews/decisions/${decision.id}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  查看决策详情
                </Link>
                <Link
                  href={`/reviews?decisionId=${decision.id}#review-form`}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  创建复盘
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ReviewForm({
  decisions,
  selectedDecisionId
}: {
  decisions: Array<{ decision: Decision; company: Company | null }>;
  selectedDecisionId?: string;
}) {
  return (
    <section id="review-form" className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">创建复盘</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        复盘不是证明自己对错，而是把假设、证据和原则校准到下一次更清晰。
      </p>

      <form action={saveReview} className="mt-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">关联决策</span>
            <select
              name="decisionId"
              defaultValue={selectedDecisionId ?? ""}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              <option value="">不关联决策</option>
              {decisions.map(({ decision, company }) => (
                <option key={decision.id} value={decision.id}>
                  {company ? `${company.stockName}（${company.stockCode}）` : "未关联公司"} / {decision.decisionDate} / {decision.finalUserJudgment.slice(0, 24)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">复盘类型</span>
            <select
              name="reviewType"
              defaultValue="post_decision"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              {reviewTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="复盘日期" name="reviewDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>

        <TextArea label="实际发生了什么" name="whatHappened" placeholder="价格、基本面、行业、财报或你的行为发生了什么变化？" />
        <TextArea label="哪些假设成立" name="assumptionsValidated" placeholder="哪些判断被事实验证？证据是什么？" />
        <TextArea label="哪些假设失败" name="assumptionsFailed" placeholder="哪些判断错了、漏了或过度乐观？" />
        <TextArea label="经验教训" name="lessons" placeholder="下次遇到类似情况，应该提前检查什么？" />
        <TextArea label="原则修订建议" name="principleChangesNeeded" placeholder="哪些投资原则需要新增、改写、收紧或删除？" />

        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="保存中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          保存复盘
        </PendingButton>
      </form>
    </section>
  );
}

function RecentReviews({
  reviews
}: {
  reviews: Array<{ review: Review; decision: Decision | null; company: Company | null }>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">最近复盘</h2>
      </div>
      <div className="mt-5 space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
            还没有复盘记录。完成一次决策后，可以回来验证你的假设。
          </div>
        ) : (
          reviews.map(({ review, decision, company }) => (
            <ReviewCard key={review.id} review={review} decision={decision} company={company} />
          ))
        )}
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  decision,
  company
}: {
  review: Review;
  decision: Decision | null;
  company: Company | null;
}) {
  const mentorDraft = `请作为耐心的价值投资导师，帮我总结这次 A 股投资复盘，并提出后续学习和原则修订建议。不要给买入或卖出建议。公司=${company ? `${company.stockName}（${company.stockCode}）` : "未关联"}；原决策=${decision?.finalUserJudgment || "未关联"}；实际发生=${review.whatHappened}；成立假设=${review.assumptionsValidated || "未填写"}；失败假设=${review.assumptionsFailed || "未填写"}；经验教训=${review.lessons}；原则修订=${review.principleChangesNeeded || "未填写"}。`;
  const opponentDraft = `请作为投资委员会反方委员，质疑我的复盘是否过于自我宽慰、归因错误或遗漏反证。不要给买入或卖出建议。公司=${company ? `${company.stockName}（${company.stockCode}）` : "未关联"}；实际发生=${review.whatHappened}；失败假设=${review.assumptionsFailed || "未填写"}；经验教训=${review.lessons}。`;

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold">{labelFor(reviewTypes, review.reviewType)}</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {company ? `${company.stockName}（${company.stockCode}）` : "未关联公司"} / {review.reviewDate}
          </p>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          复盘记录
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoBlock title="实际发生" value={review.whatHappened} />
        <InfoBlock title="经验教训" value={review.lessons} />
        <InfoBlock title="成立假设" value={review.assumptionsValidated || "未填写"} />
        <InfoBlock title="失败假设" value={review.assumptionsFailed || "未填写"} />
      </div>

      {review.principleChangesNeeded ? (
        <div className="mt-3 rounded-md border border-border bg-card p-3">
          <div className="text-xs font-semibold text-primary">原则修订建议</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.principleChangesNeeded}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {decision ? (
          <Link
            href={`/reviews/decisions/${decision.id}`}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            <FileText className="h-4 w-4" aria-hidden />
            查看决策详情
          </Link>
        ) : null}
        <Link
          href={`/mentor?role=mentor&draft=${encodeURIComponent(mentorDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <Bot className="h-4 w-4" aria-hidden />
          让导师总结
        </Link>
        <Link
          href={`/mentor?role=opponent&draft=${encodeURIComponent(opponentDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          反方追问
        </Link>
      </div>
    </article>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = ""
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}

function TextArea({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        name={name}
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
