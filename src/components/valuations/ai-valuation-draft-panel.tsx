"use client";

import { Bot, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PendingButton } from "@/components/ui/pending-button";
import type { companies } from "@/db/schema";
import { getTemplate, labelFor, scenarios, valuationTemplates, type ValuationTemplateType } from "@/lib/valuations/constants";

type Company = typeof companies.$inferSelect;

type ScenarioDraft = {
  name: "bear" | "base" | "bull";
  basisAmount: string;
  growthRate: string;
  valuationMultiple: string;
  discountRate: string;
  terminalGrowthRate: string;
  dividendYield: string;
  notes: string;
};

type ValuationDraft = {
  templateType: ValuationTemplateType;
  title: string;
  valuationDate: string;
  currentPrice: string;
  sharesOutstanding: string;
  rationale: string;
  userNotes: string;
  cautions: string[];
  scenarios: ScenarioDraft[];
};

type RawScenarioDraft = Omit<ScenarioDraft, "basisAmount" | "growthRate" | "valuationMultiple" | "discountRate" | "terminalGrowthRate" | "dividendYield"> & {
  basisAmount: number;
  growthRate: number;
  valuationMultiple: number;
  discountRate: number;
  terminalGrowthRate: number;
  dividendYield: number;
};

type RawValuationDraft = Omit<ValuationDraft, "valuationDate" | "currentPrice" | "sharesOutstanding" | "userNotes" | "scenarios"> & {
  currentPrice: number;
  sharesOutstanding: number;
  scenarios: RawScenarioDraft[];
};

type SaveValuationAction = (formData: FormData) => Promise<void>;

export function AiValuationDraftPanel({
  companies,
  saveAction
}: {
  companies: Company[];
  saveAction: SaveValuationAction;
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [templateType, setTemplateType] = useState<ValuationTemplateType>("manufacturing");
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<ValuationDraft | null>(null);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyId) ?? companies[0],
    [companies, companyId]
  );
  const template = getTemplate(draft?.templateType ?? templateType);

  async function generateDraft() {
    if (!selectedCompany || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setMessage("");
    setDraft(null);

    try {
      const response = await fetch("/api/valuations/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          templateType,
          company: {
            stockCode: selectedCompany.stockCode,
            stockName: selectedCompany.stockName,
            industry: selectedCompany.industry,
            companyType: selectedCompany.companyType,
            description: selectedCompany.description,
            thesis: selectedCompany.thesis,
            keyRisks: selectedCompany.keyRisks
          },
          sourceText
        })
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        draft?: RawValuationDraft;
      };

      if (!response.ok || !data.ok || !data.draft) {
        throw new Error(data.message ?? "AI 估值草稿生成失败。");
      }

      setDraft(toEditableDraft(data.draft));
      setTemplateType(data.draft.templateType);
      setMessage("已生成待确认估值草稿。请检查每个数字的来源，再决定是否保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 估值草稿生成失败。");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateDraft(values: Partial<ValuationDraft>) {
    setDraft((current) => (current ? { ...current, ...values } : current));
  }

  function updateScenario(name: ScenarioDraft["name"], values: Partial<ScenarioDraft>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            scenarios: current.scenarios.map((scenario) =>
              scenario.name === name ? { ...scenario, ...values } : scenario
            )
          }
        : current
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">AI 估值草稿</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            粘贴财报摘要、年报片段或你的研究笔记，让 AI 生成三情景参数草稿。AI 不联网取数，也不会自动保存，最终数字必须由你确认。
          </p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 text-muted-foreground">
          先生成草稿，再人工调整，最后保存估值
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
          先在观察池新增一家公司，再使用 AI 估值草稿。
        </div>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">目标公司</span>
              <select
                value={companyId}
                onChange={(event) => {
                  setCompanyId(event.target.value);
                  setDraft(null);
                  setMessage("");
                }}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.stockName}（{company.stockCode}）
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">估值模板</span>
              <select
                value={templateType}
                onChange={(event) => {
                  setTemplateType(event.target.value as ValuationTemplateType);
                  setDraft(null);
                  setMessage("");
                }}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
              >
                {valuationTemplates.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label} / {item.method}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">粘贴财报摘要或研究资料</span>
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                rows={9}
                placeholder="例如：最近一年营收、归母净利润、经营现金流、资本开支、自由现金流、总股本、当前价格、分红、主要风险和你的假设。"
                className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={generateDraft}
              disabled={!selectedCompany || sourceText.trim().length < 40 || isGenerating}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <Bot className="h-4 w-4" aria-hidden />
              {isGenerating ? "生成中..." : "生成三情景草稿"}
            </button>
            {message ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
                {message}
              </div>
            ) : null}
          </div>

          {draft ? (
            <form action={saveAction} className="space-y-5 rounded-lg border border-border bg-background p-4">
              <input type="hidden" name="companyId" value={selectedCompany?.id ?? ""} />
              <input type="hidden" name="templateType" value={draft.templateType} />
              <EditableSummary
                draft={draft}
                templateLabel={template.label}
                onChange={updateDraft}
              />

              <div className="grid gap-4">
                {scenarios.map((scenario) => {
                  const item = draft.scenarios.find((entry) => entry.name === scenario.value);

                  return item ? (
                    <ScenarioEditor
                      key={item.name}
                      label={scenario.label}
                      scenario={item}
                      templateType={draft.templateType}
                      onChange={(values) => updateScenario(item.name, values)}
                    />
                  ) : null;
                })}
              </div>

              <label className="block">
                <span className="text-sm font-semibold">备注和资料来源</span>
                <textarea
                  name="userNotes"
                  value={draft.userNotes}
                  onChange={(event) => updateDraft({ userNotes: event.target.value })}
                  rows={4}
                  className="mt-2 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
                />
              </label>

              <PendingButton
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                pendingChildren="保存中..."
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                确认并保存估值
              </PendingButton>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background p-6">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">估值草稿会显示在这里</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    AI 会给出三情景参数、模板理由和待确认事项。缺失的数据会保留为 0，保存前需要你补齐。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EditableSummary({
  draft,
  templateLabel,
  onChange
}: {
  draft: ValuationDraft;
  templateLabel: string;
  onChange: (values: Partial<ValuationDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold">待确认草稿</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            模板：{templateLabel}
          </p>
        </div>
        {draft.cautions.length > 0 ? (
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            待确认 {draft.cautions.length} 项
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DraftInput label="估值标题" name="title" value={draft.title} onChange={(value) => onChange({ title: value })} />
        <DraftInput
          label="估值日期"
          name="valuationDate"
          type="date"
          value={draft.valuationDate}
          onChange={(value) => onChange({ valuationDate: value })}
        />
        <DraftInput
          label="当前价格（元/股）"
          name="currentPrice"
          type="number"
          step="0.01"
          value={draft.currentPrice}
          onChange={(value) => onChange({ currentPrice: value })}
        />
        <DraftInput
          label="总股本（亿股）"
          name="sharesOutstanding"
          type="number"
          step="0.0001"
          value={draft.sharesOutstanding}
          onChange={(value) => onChange({ sharesOutstanding: value })}
        />
      </div>

      {draft.cautions.length > 0 ? (
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs font-semibold text-primary">AI 提醒</div>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
            {draft.cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ScenarioEditor({
  label,
  scenario,
  templateType,
  onChange
}: {
  label: string;
  scenario: ScenarioDraft;
  templateType: ValuationTemplateType;
  onChange: (values: Partial<ScenarioDraft>) => void;
}) {
  const template = getTemplate(templateType);
  const isManufacturing = templateType === "manufacturing";

  return (
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-sm font-semibold">{label}情景</legend>
      <div className="grid gap-4 md:grid-cols-3">
        <DraftInput
          label={template.basisLabel}
          name={`${scenario.name}.basisAmount`}
          type="number"
          step="0.0001"
          value={scenario.basisAmount}
          onChange={(value) => onChange({ basisAmount: value })}
        />
        <DraftInput
          label={template.growthLabel}
          name={`${scenario.name}.growthRate`}
          type="number"
          step="0.1"
          value={scenario.growthRate}
          suffix="%"
          onChange={(value) => onChange({ growthRate: value })}
        />
        <DraftInput
          label={template.multipleLabel}
          name={`${scenario.name}.valuationMultiple`}
          type="number"
          step="0.01"
          value={scenario.valuationMultiple}
          onChange={(value) => onChange({ valuationMultiple: value })}
        />
        <DraftInput
          label="折现率"
          name={`${scenario.name}.discountRate`}
          type="number"
          step="0.1"
          value={scenario.discountRate}
          suffix="%"
          readOnly={!isManufacturing}
          onChange={(value) => onChange({ discountRate: value })}
        />
        <DraftInput
          label="永续增长率"
          name={`${scenario.name}.terminalGrowthRate`}
          type="number"
          step="0.1"
          value={scenario.terminalGrowthRate}
          suffix="%"
          readOnly={!isManufacturing}
          onChange={(value) => onChange({ terminalGrowthRate: value })}
        />
        <DraftInput
          label="预期股息率"
          name={`${scenario.name}.dividendYield`}
          type="number"
          step="0.1"
          value={scenario.dividendYield}
          suffix="%"
          onChange={(value) => onChange({ dividendYield: value })}
        />
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold">情景说明</span>
        <textarea
          name={`${scenario.name}.notes`}
          value={scenario.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          rows={3}
          className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
        />
      </label>
    </fieldset>
  );
}

function DraftInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  step,
  suffix,
  readOnly = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-2 flex rounded-md border border-border bg-background focus-within:border-primary">
        <input
          name={name}
          type={type}
          step={step}
          value={value}
          readOnly={readOnly}
          aria-disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-2 text-sm outline-none read-only:text-muted-foreground"
        />
        {suffix ? <span className="border-l border-border px-3 py-2 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

function toEditableDraft(draft: RawValuationDraft): ValuationDraft {
  return {
    templateType: draft.templateType,
    title: draft.title,
    valuationDate: new Date().toISOString().slice(0, 10),
    currentPrice: toInputValue(draft.currentPrice),
    sharesOutstanding: toInputValue(draft.sharesOutstanding),
    rationale: draft.rationale,
    userNotes: buildUserNotes(draft.rationale, draft.cautions),
    cautions: draft.cautions,
    scenarios: draft.scenarios.map((scenario) => ({
      ...scenario,
      basisAmount: toInputValue(scenario.basisAmount),
      growthRate: toInputValue(scenario.growthRate),
      valuationMultiple: toInputValue(scenario.valuationMultiple),
      discountRate: toInputValue(scenario.discountRate),
      terminalGrowthRate: toInputValue(scenario.terminalGrowthRate),
      dividendYield: toInputValue(scenario.dividendYield)
    }))
  };
}

function toInputValue(value: number) {
  return Number.isFinite(value) && value > 0 ? String(value) : "";
}

function buildUserNotes(rationale: string, cautions: string[]) {
  const cautionText = cautions.length > 0 ? `\n\n待确认：\n${cautions.map((item) => `- ${item}`).join("\n")}` : "";

  return `${rationale}${cautionText}`.trim();
}
