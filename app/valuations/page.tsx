import Link from "next/link";
import { AlertCircle, Bot, Calculator, CheckCircle2, ShieldAlert, Sigma } from "lucide-react";
import { PendingButton } from "@/components/ui/pending-button";
import { SectionHeader } from "@/components/ui/section-header";
import { AiValuationDraftPanel } from "@/components/valuations/ai-valuation-draft-panel";
import { MarketSnapshotLookup } from "@/components/valuations/market-snapshot-lookup";
import { SensitivityChartLazy } from "@/components/valuations/sensitivity-chart-lazy";
import type { companies, valuations } from "@/db/schema";
import {
  calculateValuationSensitivity,
  type ValuationResult,
  type ValuationScenarioInput
} from "@/lib/valuations/calculations";
import {
  getTemplate,
  labelFor,
  scenarios,
  valuationTemplates,
  type ValuationTemplateType
} from "@/lib/valuations/constants";
import { getValuationsPageData } from "@/lib/valuations/queries";
import { saveValuation } from "./actions";

type ValuationsPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

type Company = typeof companies.$inferSelect;
type Valuation = typeof valuations.$inferSelect;

const defaultScenarioValues = {
  bear: { basisAmount: "", growthRate: "0", valuationMultiple: "", discountRate: "12", terminalGrowthRate: "2", dividendYield: "0" },
  base: { basisAmount: "", growthRate: "5", valuationMultiple: "", discountRate: "10", terminalGrowthRate: "2.5", dividendYield: "0" },
  bull: { basisAmount: "", growthRate: "10", valuationMultiple: "", discountRate: "9", terminalGrowthRate: "3", dividendYield: "0" }
};

export default async function ValuationsPage({ searchParams }: ValuationsPageProps) {
  const paramsPromise: Promise<{ status?: string; message?: string }> = searchParams ?? Promise.resolve({});
  const [params, data] = await Promise.all([paramsPromise, getValuationsPageData()]);

  return (
    <main className="space-y-8">
      <section className="hero-panel rounded-lg p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            title="估值工具"
            description="用四类 A 股模板完成三情景估值：只输出区间、假设、安全边际和风险提醒，不输出买入或卖出建议。"
          />
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card/80 p-3 text-center">
            <Metric label="模板" value={valuationTemplates.length} />
            <Metric label="公司" value={data.companies.length} />
            <Metric label="估值" value={data.valuations.length} />
          </div>
        </div>
      </section>

      {params.message ? (
        <StatusBanner status={params.status === "success" ? "success" : "error"} message={params.message} />
      ) : null}

      <TemplateSelectionGuide />

      <AiValuationDraftPanel companies={data.companies} saveAction={saveValuation} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="page-panel rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">创建估值</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            数量单位建议统一：当前价格为元/股，总股本为亿股；利润、自由现金流为亿元。这样计算出的每股估值约为元/股。
          </p>
          <div className="mt-5 space-y-5">
            {valuationTemplates.map((template) => (
              <ValuationForm
                key={template.value}
                templateType={template.value}
                companies={data.companies}
              />
            ))}
          </div>
        </section>

        <RecentValuations valuations={data.valuations} />
      </section>
    </main>
  );
}

function ValuationForm({
  templateType,
  companies
}: {
  templateType: ValuationTemplateType;
  companies: Company[];
}) {
  const template = getTemplate(templateType);

  return (
    <details className="rounded-lg border border-border bg-background p-4 open:bg-card" open={templateType === "financial"}>
      <summary className="cursor-pointer text-sm font-semibold">
        {template.label} <span className="text-muted-foreground">/ {template.method}</span>
      </summary>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{template.focus}</p>

      <form action={saveValuation} className="mt-4 space-y-5">
        <input type="hidden" name="templateType" value={templateType} />
        <div data-market-snapshot-lookup-active>
          <MarketSnapshotLookup companies={companies} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
          <Field label="估值标题" name="title" defaultValue={`${template.label}估值`} />
          <Field label="估值日期" name="valuationDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <Field label="当前价格（元/股）" name="currentPrice" type="number" step="0.01" placeholder="例如：72.50" />
          <Field label="总股本（亿股）" name="sharesOutstanding" type="number" step="0.0001" placeholder="例如：76.63" />
        </div>

        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <ScenarioFields
              key={scenario.value}
              scenario={scenario.value}
              label={scenario.label}
              templateType={templateType}
            />
          ))}
        </div>

        <TextArea label="备注和资料来源" name="userNotes" placeholder="写下数据来源、关键假设、还没确认的问题。不要把模型输出当成事实。" />

        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="计算并保存中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          计算并保存估值
        </PendingButton>
      </form>
    </details>
  );
}

function TemplateSelectionGuide() {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="模板选择指南"
        description="先判断公司靠什么创造价值，再选主模板；复杂公司可以用第二个模板交叉验证。这里帮助你选工具，不给买卖结论。"
      />
      <div className="grid gap-4 lg:grid-cols-4">
        {valuationTemplates.map((template) => (
          <article key={template.value} className="rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:bg-muted">
            <div className="text-sm font-semibold">{template.label}</div>
            <p className="mt-1 text-xs text-primary">{template.method}</p>
            <InfoLine title="适合" value={template.fitFor} />
            <InfoLine title="慎用" value={template.avoidFor} />
            <InfoLine title="例子" value={template.examples} />
          </article>
        ))}
      </div>
      <div className="page-panel rounded-lg p-4 text-sm leading-6">
        <span className="font-semibold">美的集团这类成熟消费制造公司：</span>
        优先用制造业模板看自由现金流、资本开支和营运资本，再用消费股模板用利润增长和 PE 做交叉验证。
      </div>
    </section>
  );
}

function ScenarioFields({
  scenario,
  label,
  templateType
}: {
  scenario: "bear" | "base" | "bull";
  label: string;
  templateType: ValuationTemplateType;
}) {
  const template = getTemplate(templateType);
  const defaults = defaultScenarioValues[scenario];
  const isFinancial = templateType === "financial";
  const isManufacturing = templateType === "manufacturing";

  return (
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-sm font-semibold">{label}情景</legend>
      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label={template.basisLabel}
          name={`${scenario}.basisAmount`}
          type="number"
          step="0.0001"
          placeholder={template.basisHint}
          defaultValue={defaults.basisAmount}
        />
        <Field
          label={template.growthLabel}
          name={`${scenario}.growthRate`}
          type="number"
          step="0.1"
          defaultValue={isFinancial ? "0" : defaults.growthRate}
          suffix="%"
        />
        <Field
          label={template.multipleLabel}
          name={`${scenario}.valuationMultiple`}
          type="number"
          step="0.01"
          defaultValue={defaults.valuationMultiple}
        />
        <Field
          label="折现率"
          name={`${scenario}.discountRate`}
          type="number"
          step="0.1"
          defaultValue={defaults.discountRate}
          suffix="%"
          disabled={!isManufacturing}
        />
        <Field
          label="永续增长率"
          name={`${scenario}.terminalGrowthRate`}
          type="number"
          step="0.1"
          defaultValue={defaults.terminalGrowthRate}
          suffix="%"
          disabled={!isManufacturing}
        />
        <Field
          label="预期股息率"
          name={`${scenario}.dividendYield`}
          type="number"
          step="0.1"
          defaultValue={defaults.dividendYield}
          suffix="%"
        />
      </div>
      <TextArea label="情景说明" name={`${scenario}.notes`} placeholder="这个情景成立需要哪些条件？哪些变量最敏感？" />
    </fieldset>
  );
}

function RecentValuations({
  valuations
}: {
  valuations: Array<{ valuation: Valuation; company: Company | null }>;
}) {
  return (
    <section className="page-panel rounded-lg p-6">
      <div className="flex items-center gap-2">
        <Sigma className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">最近估值</h2>
      </div>
      <div className="mt-5 space-y-4">
        {valuations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
            还没有估值记录。先选择一个模板，录入三情景参数并保存。
          </div>
        ) : (
          valuations.map(({ valuation, company }) => (
            <ValuationCard key={valuation.id} valuation={valuation} company={company} />
          ))
        )}
      </div>
    </section>
  );
}

function InfoLine({ title, value }: { title: string; value: string }) {
  return (
    <p className="mt-3 text-sm leading-6 text-muted-foreground">
      <span className="font-semibold text-foreground">{title}：</span>
      {value}
    </p>
  );
}

function ValuationCard({ valuation, company }: { valuation: Valuation; company: Company | null }) {
  const result = parseJson<ValuationResult>(valuation.resultJson);
  const bear = parseJson<ValuationScenarioInput>(valuation.scenarioBearJson);
  const base = parseJson<ValuationScenarioInput>(valuation.scenarioBaseJson);
  const bull = parseJson<ValuationScenarioInput>(valuation.scenarioBullJson);
  const template = getTemplate(valuation.templateType);
  const currentPrice = valuation.currentPrice / 100;
  const sharesOutstanding = valuation.sharesOutstanding / 100;
  const sensitivityMatrix = isScenarioInput(base)
    ? calculateValuationSensitivity({
        templateType: template.value,
        currentPrice,
        sharesOutstanding,
        baseScenario: base
      })
    : undefined;
  const aiDraft = `请作为耐心的价值投资导师，用通俗语言解释这份 A 股估值。不要给买入或卖出建议，只解释估值方法、关键参数、安全边际和主要风险。公司=${company ? `${company.stockName}（${company.stockCode}）` : "未关联"}；模板=${template.label}；当前价格=${formatNumber(currentPrice)}；估值区间=${formatNumber(result.lowValuePerShare)}-${formatNumber(result.highValuePerShare)}；中性情景=${formatNumber(result.baseValuePerShare)}；安全边际=${formatPercent(result.baseMarginOfSafety)}；悲观假设=${bear.notes || "未填写"}；中性假设=${base.notes || "未填写"}；乐观假设=${bull.notes || "未填写"}。`;
  const opponentDraft = `请作为投资委员会反方委员，质疑这份 A 股估值。不要给买入或卖出建议，请重点找乐观假设、模型误用、风险遗漏和需要补证据的地方。公司=${company ? `${company.stockName}（${company.stockCode}）` : "未关联"}；模板=${template.label}；当前价格=${formatNumber(currentPrice)}；估值区间=${formatNumber(result.lowValuePerShare)}-${formatNumber(result.highValuePerShare)}；中性安全边际=${formatPercent(result.baseMarginOfSafety)}；风险提示=${result.riskFlags.join("；") || "无"}。`;

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold">{valuation.title}</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {company ? `${company.stockName}（${company.stockCode}）` : "未关联公司"} / {labelFor(valuationTemplates, valuation.templateType)} / {valuation.valuationDate}
          </p>
        </div>
        <span className="status-chip status-chip-warn">
          {template.method}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <InfoBlock title="估值区间" value={`${formatNumber(result.lowValuePerShare)} - ${formatNumber(result.highValuePerShare)} 元/股`} />
        <InfoBlock title="中性情景" value={`${formatNumber(result.baseValuePerShare)} 元/股`} />
        <InfoBlock title="安全边际" value={formatPercent(result.baseMarginOfSafety)} />
      </div>

      <SensitivityChartLazy
        currentPrice={currentPrice}
        data={result.scenarioResults.map((scenario) => ({
          name: labelFor(scenarios, scenario.name),
          valuePerShare: scenario.valuePerShare,
          marginOfSafety: scenario.marginOfSafety,
          impliedUpside: scenario.impliedUpside
        }))}
        matrix={sensitivityMatrix}
      />

      {result.riskFlags.length > 0 ? (
        <div className="mt-4 rounded-md border border-border bg-card p-3">
          <div className="text-xs font-semibold text-primary">风险提醒</div>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
            {result.riskFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/mentor?role=mentor&draft=${encodeURIComponent(aiDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <Bot className="h-4 w-4" aria-hidden />
          让导师解释
        </Link>
        <Link
          href={`/mentor?role=opponent&draft=${encodeURIComponent(opponentDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          反方质询
        </Link>
      </div>
    </article>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  defaultValue = "",
  placeholder,
  suffix,
  disabled = false
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-2 flex rounded-md border border-border bg-background focus-within:border-primary">
        <input
          name={name}
          type={type}
          step={step}
          defaultValue={defaultValue}
          placeholder={placeholder}
          readOnly={disabled}
          aria-disabled={disabled}
          className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-2 text-sm outline-none read-only:text-muted-foreground"
        />
        {suffix ? <span className="border-l border-border px-3 py-2 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
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
    <label className="mt-4 block">
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
    <div className="metric-card">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "0.0%";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function isScenarioInput(value: Partial<ValuationScenarioInput>): value is ValuationScenarioInput {
  return (
    typeof value.basisAmount === "number" &&
    typeof value.growthRate === "number" &&
    typeof value.valuationMultiple === "number" &&
    typeof value.discountRate === "number" &&
    typeof value.terminalGrowthRate === "number"
  );
}
