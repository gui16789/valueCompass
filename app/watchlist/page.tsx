import Link from "next/link";
import { Bot, Building2, CheckCircle2, ShieldAlert } from "lucide-react";
import { PendingButton } from "@/components/ui/pending-button";
import { addCompany, updateCompany } from "./actions";
import type { companies } from "@/db/schema";
import {
  companyTypes,
  exchanges,
  labelFor,
  valuationStatuses,
  watchStatuses
} from "@/lib/watchlist/constants";
import { getWatchlistCompanies } from "@/lib/watchlist/queries";

type Company = typeof companies.$inferSelect;

export default async function WatchlistPage() {
  const watchlist = await getWatchlistCompanies();
  const circleCount = watchlist.filter((company) => company.inCircle).length;

  return (
    <main className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">A 股观察池</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">把公司研究放进一条可维护的流水线</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              手动维护公司、能力圈、研究状态、估值状态、关键风险和下一步行动。这里不输出买入建议，只帮助你组织研究。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3 text-center">
            <Metric label="公司" value={watchlist.length} />
            <Metric label="能力圈" value={circleCount} />
            <Metric label="待估值" value={watchlist.filter((company) => company.valuationStatus === "not_started").length} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">新增公司</h2>
          </div>
          <CompanyForm action={addCompany} submitText="加入观察池" />
        </div>

        <div className="space-y-4">
          {watchlist.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <p className="font-semibold">观察池还是空的</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                先添加一家公司，例如你正在学习的银行、消费、周期或制造业案例。
              </p>
            </div>
          ) : (
            watchlist.map((company) => <CompanyCard key={company.id} company={company} />)
          )}
        </div>
      </section>
    </main>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const researchDraft = `请作为 A 股研究助理，帮我为 ${company.stockName}（${company.stockCode}）整理研究框架。请区分事实、推断、观点和待确认事项，不要给买入或卖出建议。当前我的记录：行业=${company.industry || "未填写"}，公司类型=${labelFor(companyTypes, company.companyType)}，状态=${labelFor(watchStatuses, company.watchStatus)}，关键风险=${company.keyRisks || "未填写"}。`;
  const opponentDraft = `请作为投资委员会反方委员，质疑我对 ${company.stockName}（${company.stockCode}）的观察理由。不要给买入卖出建议，请围绕商业模式、财务质量、估值假设、风险和我的能力圈提出追问。我的初步观点：${company.thesis || "暂未填写"}`;

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
            <span>{company.stockCode}</span>
            <span>/</span>
            <span>{labelFor(exchanges, company.exchange)}</span>
            <span>/</span>
            <span>{labelFor(companyTypes, company.companyType)}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold">{company.stockName}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {company.description || "还没有公司简介。"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={labelFor(watchStatuses, company.watchStatus)} />
          <StatusPill label={labelFor(valuationStatuses, company.valuationStatus)} />
          <StatusPill label={company.inCircle ? "能力圈内" : "能力圈外/待确认"} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <InfoBlock title="投资假设" value={company.thesis || "未填写"} />
        <InfoBlock title="关键风险" value={company.keyRisks || "未填写"} />
        <InfoBlock title="下一步行动" value={company.nextAction || "未填写"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
          反方质询
        </Link>
      </div>

      <details className="mt-4 rounded-lg border border-border bg-background p-4">
        <summary className="cursor-pointer text-sm font-semibold">编辑研究状态</summary>
        <CompanyForm
          action={updateCompany}
          company={company}
          submitText="保存公司记录"
          className="mt-4"
        />
      </details>
    </article>
  );
}

function CompanyForm({
  action,
  company,
  submitText,
  className = "mt-5"
}: {
  action: (formData: FormData) => Promise<void>;
  company?: Company;
  submitText: string;
  className?: string;
}) {
  return (
    <form action={action} className={`${className} space-y-4`}>
      {company ? <input type="hidden" name="companyId" value={company.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="股票代码" name="stockCode" defaultValue={company?.stockCode} placeholder="例如：600519" />
        <Field label="公司名称" name="stockName" defaultValue={company?.stockName} placeholder="例如：贵州茅台" />
        <SelectField label="交易所" name="exchange" options={exchanges} defaultValue={company?.exchange ?? "SH"} />
        <Field label="行业" name="industry" defaultValue={company?.industry} placeholder="例如：白酒 / 银行 / 家电" />
        <SelectField label="公司类型" name="companyType" options={companyTypes} defaultValue={company?.companyType ?? "other"} />
        <SelectField label="研究状态" name="watchStatus" options={watchStatuses} defaultValue={company?.watchStatus ?? "watching"} />
        <SelectField
          label="估值状态"
          name="valuationStatus"
          options={valuationStatuses}
          defaultValue={company?.valuationStatus ?? "not_started"}
        />
        <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <input name="inCircle" type="checkbox" defaultChecked={company?.inCircle ?? false} />
          在我的能力圈内
        </label>
      </div>

      <TextArea label="公司简介" name="description" defaultValue={company?.description} placeholder="用一两句话描述这家公司靠什么赚钱。" />
      <TextArea label="投资假设" name="thesis" defaultValue={company?.thesis} placeholder="如果继续研究，它可能值得研究的理由是什么？" />
      <TextArea label="关键风险" name="keyRisks" defaultValue={company?.keyRisks} placeholder="写下最可能推翻判断的风险。" />
      <TextArea label="下一步行动" name="nextAction" defaultValue={company?.nextAction} placeholder="例如：阅读年报、补财务数据、做估值、等待价格。" />

      <PendingButton
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        pendingChildren="保存中..."
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {submitText}
      </PendingButton>
    </form>
  );
}

function Field({
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
      <input
        name={name}
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

function StatusPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
      {label}
    </span>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-card px-4 py-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
