import { NextResponse } from "next/server";
import { z } from "zod";
import { callOpenAICompatibleChat } from "@/lib/ai/openai-compatible";
import { decryptSecret } from "@/lib/encryption/crypto";
import { getEastmoneyFinancialSnapshot, getEastmoneyMarketSnapshot } from "@/lib/market-data/eastmoney";
import type { FinancialIndicatorRecord, FinancialSnapshot, MarketSnapshot } from "@/lib/market-data/types";
import { getModelProviderForRole } from "@/lib/model-config/queries";
import { getTemplate, scenarios, valuationTemplates, type ValuationTemplateType } from "@/lib/valuations/constants";

const draftRequestSchema = z.object({
  company: z.object({
    stockCode: z.string().trim().min(1),
    stockName: z.string().trim().min(1),
    industry: z.string().trim().optional(),
    companyType: z.string().trim().optional(),
    description: z.string().trim().optional(),
    thesis: z.string().trim().optional(),
    keyRisks: z.string().trim().optional()
  }),
  templateType: z.enum(["financial", "cyclical", "consumer", "manufacturing"]),
  sourceText: z.string().trim().max(16000, "单次资料不能超过 16000 字。").default("")
});

const scenarioDraftSchema = z.object({
  name: z.enum(["bear", "base", "bull"]),
  basisAmount: z.coerce.number().nonnegative().default(0),
  growthRate: z.coerce.number().default(0),
  valuationMultiple: z.coerce.number().nonnegative().default(0),
  discountRate: z.coerce.number().positive().default(10),
  terminalGrowthRate: z.coerce.number().default(2),
  dividendYield: z.coerce.number().nonnegative().default(0),
  notes: z.string().trim().default("")
});

const draftResponseSchema = z.object({
  templateType: z.enum(["financial", "cyclical", "consumer", "manufacturing"]),
  title: z.string().trim().default("AI 估值草稿"),
  currentPrice: z.coerce.number().nonnegative().default(0),
  sharesOutstanding: z.coerce.number().nonnegative().default(0),
  rationale: z.string().trim().default(""),
  cautions: z.array(z.string().trim()).default([]),
  scenarios: z.array(scenarioDraftSchema).length(3)
});

const allowedTemplateValues = valuationTemplates.map((template) => template.value).join(", ");
const scenarioLabels = scenarios.map((scenario) => `${scenario.value}=${scenario.label}`).join(", ");

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = draftRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: normalizeZodMessage(parsed.error.issues[0]?.message)
      },
      { status: 400 }
    );
  }

  try {
    const modelConfig = await getModelProviderForRole("research_assistant");

    if (!modelConfig) {
      throw new Error("还没有可用的模型配置。请先到设置页新增并测试模型提供商。");
    }

    const template = getTemplate(parsed.data.templateType);
    const [marketSnapshotResult, financialSnapshotResult] = await Promise.all([
      getMarketSnapshotForDraft(parsed.data.company.stockCode),
      getFinancialSnapshotForDraft(parsed.data.company.stockCode)
    ]);
    const marketSnapshotText = formatMarketSnapshotForPrompt(marketSnapshotResult.snapshot, marketSnapshotResult.error);
    const financialSnapshotText = formatFinancialSnapshotForPrompt(financialSnapshotResult.snapshot, financialSnapshotResult.error);
    const rawContent = await callOpenAICompatibleChat({
      config: {
        apiBaseUrl: modelConfig.provider.apiBaseUrl,
        apiKey: decryptSecret(modelConfig.provider.apiKeyEncrypted),
        model: modelConfig.modelName,
        temperature: Math.min(modelConfig.temperature / 100, 0.2),
        allowInsecureTls: modelConfig.provider.allowInsecureTls
      },
      messages: [
        {
          role: "system",
          content: `你是 A 股价值投资估值助理。你只能根据用户提供的资料生成估值参数草稿，不能编造资料中没有的数据，不能输出买入、卖出、持有、目标价或仓位建议。

严格规则：
- 只返回 JSON，不要使用 Markdown。
- 所有数字必须来自用户资料、系统提供的行情快照、用户明确给出的上下文，或写成保守的待确认占位。不能自行联网搜索。
- 如果资料缺少当前价格、总股本或估值起点，填 0，并在 cautions 写清需要人工补充。
- 如果系统行情快照提供了 currentPrice 或 sharesOutstanding，可以使用该数值，但必须在 cautions 或 rationale 中说明来源和仍需核对。
- growthRate、discountRate、terminalGrowthRate、dividendYield 使用百分数，例如 5 表示 5%，不要用 0.05。
- sharesOutstanding 单位是亿股；currentPrice 单位是元/股。
- financial 模板 basisAmount 是每股净资产，cyclical/consumer/manufacturing 模板 basisAmount 单位是亿元。
- templateType 只能是：${allowedTemplateValues}。情景只能是：${scenarioLabels}。
- 三个情景必须按 bear、base、bull 各返回一个。
- notes 必须说明该情景依赖的关键假设和待确认事项。
- 所有文字字段必须使用中文。不要输出 templateType、currentPrice、sharesOutstanding、basisAmount、dividendYield 等内部字段名。
- 必须优先使用系统财务摘要中的最近年报、最新季报和机构预测；没有数据时才提示人工补充。

JSON 字段：
{
  "templateType": "${parsed.data.templateType}",
  "title": "",
  "currentPrice": 0,
  "sharesOutstanding": 0,
  "rationale": "",
  "cautions": [],
  "scenarios": [
    {
      "name": "bear",
      "basisAmount": 0,
      "growthRate": 0,
      "valuationMultiple": 0,
      "discountRate": 12,
      "terminalGrowthRate": 2,
      "dividendYield": 0,
      "notes": ""
    },
    {
      "name": "base",
      "basisAmount": 0,
      "growthRate": 5,
      "valuationMultiple": 0,
      "discountRate": 10,
      "terminalGrowthRate": 2.5,
      "dividendYield": 0,
      "notes": ""
    },
    {
      "name": "bull",
      "basisAmount": 0,
      "growthRate": 10,
      "valuationMultiple": 0,
      "discountRate": 9,
      "terminalGrowthRate": 3,
      "dividendYield": 0,
      "notes": ""
    }
  ]
}`
        },
        {
          role: "user",
          content: `公司上下文：
股票代码：${parsed.data.company.stockCode}
公司名称：${parsed.data.company.stockName}
行业：${parsed.data.company.industry || "未填写"}
公司类型：${parsed.data.company.companyType || "未填写"}
公司简介：${parsed.data.company.description || "未填写"}
已有投资假设：${parsed.data.company.thesis || "未填写"}
关键风险：${parsed.data.company.keyRisks || "未填写"}

用户选择模板：
${template.label} / ${template.method}
模板适用说明：${template.fitFor}
模板慎用说明：${template.avoidFor}

系统行情快照：
${marketSnapshotText}

系统财务摘要：
${financialSnapshotText}

用户粘贴资料：
${parsed.data.sourceText || "用户未补充额外资料。"}`
        }
      ]
    });

    const extracted = draftResponseSchema.parse(extractJson(rawContent));

    return NextResponse.json({
      ok: true,
      draft: normalizeDraft(
        extracted,
        parsed.data.templateType,
        marketSnapshotResult.snapshot,
        marketSnapshotResult.error,
        financialSnapshotResult.snapshot,
        financialSnapshotResult.error
      )
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "AI 估值草稿生成失败。"
      },
      { status: 500 }
    );
  }
}

function normalizeZodMessage(message?: string) {
  return !message || message === "Required" ? "请求格式不正确，请选择公司、模板并粘贴资料。" : message;
}

async function getMarketSnapshotForDraft(stockCode: string): Promise<{ snapshot: MarketSnapshot | null; error: string }> {
  try {
    return {
      snapshot: await getEastmoneyMarketSnapshot(stockCode),
      error: ""
    };
  } catch (error) {
    return {
      snapshot: null,
      error: error instanceof Error ? error.message : "行情快照获取失败"
    };
  }
}

async function getFinancialSnapshotForDraft(stockCode: string): Promise<{ snapshot: FinancialSnapshot | null; error: string }> {
  try {
    return {
      snapshot: await getEastmoneyFinancialSnapshot(stockCode),
      error: ""
    };
  } catch (error) {
    return {
      snapshot: null,
      error: error instanceof Error ? error.message : "财务摘要获取失败"
    };
  }
}

function formatMarketSnapshotForPrompt(snapshot: MarketSnapshot | null, error: string) {
  if (!snapshot) {
    return `未获取到行情快照。原因：${error || "未知"}`;
  }

  return [
    `来源：${snapshot.source}`,
    `来源链接：${snapshot.sourceUrl}`,
    `获取时间：${snapshot.fetchedAt}`,
    `公司：${snapshot.name}（${snapshot.code}）`,
    `当前价格：${snapshot.price} 元/股`,
    `总股本：${snapshot.totalShares ? snapshot.totalShares / 100000000 : 0} 亿股`,
    `PE TTM：${snapshot.peTtm ?? "无"}`,
    `PB：${snapshot.pb ?? "无"}`,
    `总市值：${snapshot.totalMarketCap ? snapshot.totalMarketCap / 100000000 : "无"} 亿元`,
    `流通市值：${snapshot.floatMarketCap ? snapshot.floatMarketCap / 100000000 : "无"} 亿元`,
    `提示：行情快照只用于估值基础字段自动填充，保存前需要用户核对。`
  ].join("\n");
}

function formatFinancialSnapshotForPrompt(snapshot: FinancialSnapshot | null, error: string) {
  if (!snapshot) {
    return `未获取到财务摘要。原因：${error || "未知"}`;
  }

  return [
    `来源：${snapshot.source}`,
    `来源链接：${snapshot.sourceUrl}`,
    `获取时间：${snapshot.fetchedAt}`,
    `公司：${snapshot.name || snapshot.code}`,
    `最新报告：${formatIndicatorForPrompt(snapshot.latest)}`,
    `最近年报：${snapshot.yearly.slice(0, 3).map(formatIndicatorForPrompt).join("；") || "无"}`,
    `机构预测：${snapshot.forecasts.map((item) => `${item.year}${item.yearMark ? ` ${item.yearMark}` : ""}：归母净利润${formatYi(item.parentNetProfit)}亿元，增速${formatPercent(item.parentNetProfitGrowth)}，EPS ${formatMetric(item.eps)}，PE ${formatMetric(item.pe)}`).join("；") || "无"}`,
    `提示：财务摘要来自网页接口，保存估值前应核对上市公司公告、年报和口径。`
  ].join("\n");
}

function formatIndicatorForPrompt(record: FinancialIndicatorRecord | null) {
  if (!record) {
    return "无";
  }

  return [
    `${record.reportType || "报告"} ${record.reportDate || ""}`,
    `营收${formatYi(record.revenue)}亿元`,
    `归母净利润${formatYi(record.parentNetProfit)}亿元`,
    `扣非净利润${formatYi(record.deductedNetProfit)}亿元`,
    `自由现金流${formatYi(record.freeCashFlow)}亿元`,
    `EPS ${formatMetric(record.eps)}`,
    `每股净资产${formatMetric(record.bps)}`,
    `ROE ${formatPercent(record.roe)}`,
    `ROIC ${formatPercent(record.roic)}`,
    `毛利率${formatPercent(record.grossMargin)}`,
    `资产负债率${formatPercent(record.debtToAssetRatio)}`,
    `营收增速${formatPercent(record.revenueGrowth)}`,
    `利润增速${formatPercent(record.profitGrowth)}`
  ].join("，");
}

function normalizeDraft(
  draft: z.infer<typeof draftResponseSchema>,
  fallbackTemplateType: ValuationTemplateType,
  snapshot: MarketSnapshot | null,
  snapshotError: string,
  financialSnapshot: FinancialSnapshot | null,
  financialSnapshotError: string
) {
  const scenarioMap = new Map(draft.scenarios.map((scenario) => [scenario.name, scenario]));
  const snapshotCurrentPrice = snapshot?.price ?? 0;
  const snapshotSharesOutstanding = snapshot?.totalShares ? snapshot.totalShares / 100000000 : 0;
  const snapshotCautions = buildSnapshotCautions(draft, snapshot, snapshotError);
  const financialCautions = buildFinancialCautions(financialSnapshot, financialSnapshotError);
  const completedScenarios = completeScenarioDrafts(fallbackTemplateType, scenarioMap, snapshot, financialSnapshot);

  return {
    ...draft,
    templateType: fallbackTemplateType,
    currentPrice: draft.currentPrice > 0 ? draft.currentPrice : snapshotCurrentPrice,
    sharesOutstanding: draft.sharesOutstanding > 0 ? draft.sharesOutstanding : snapshotSharesOutstanding,
    rationale: toChineseText(appendFinancialRationale(appendSnapshotRationale(draft.rationale, snapshot), financialSnapshot, fallbackTemplateType)),
    cautions: [...draft.cautions.map(toChineseText), ...snapshotCautions, ...financialCautions],
    scenarios: completedScenarios
  };
}

function buildSnapshotCautions(draft: z.infer<typeof draftResponseSchema>, snapshot: MarketSnapshot | null, snapshotError: string) {
  const cautions: string[] = [];

  if (!snapshot) {
    cautions.push(`未能自动获取行情快照：${snapshotError || "未知错误"}。当前价格和总股本需要手动核对。`);
    return cautions;
  }

  if (draft.currentPrice <= 0 && snapshot.price > 0) {
    cautions.push(`当前价格已由${snapshot.source}行情快照自动填入，获取时间 ${formatDateTime(snapshot.fetchedAt)}，保存前请核对。`);
  }
  if (draft.sharesOutstanding <= 0 && snapshot.totalShares) {
    cautions.push(`总股本已由${snapshot.source}行情快照自动换算为亿股，保存前请核对最新股本变动。`);
  }
  if (snapshot.peTtm || snapshot.pb || snapshot.totalMarketCap) {
    cautions.push(`参考估值指标：PE TTM ${formatMetric(snapshot.peTtm)}，PB ${formatMetric(snapshot.pb)}，总市值 ${snapshot.totalMarketCap ? (snapshot.totalMarketCap / 100000000).toFixed(2) : "无"} 亿元。`);
  }

  return cautions;
}

function buildFinancialCautions(snapshot: FinancialSnapshot | null, snapshotError: string) {
  if (!snapshot) {
    return [`未能自动获取财务摘要：${snapshotError || "未知错误"}。估值起点需要手动补充。`];
  }

  const cautions = [
    `已读取${snapshot.source}基础财务摘要，包含最新报告、最近年报和机构预测；保存前请核对上市公司公告和年报口径。`
  ];

  if (snapshot.warnings.length > 0) {
    cautions.push(...snapshot.warnings);
  }

  return cautions;
}

function appendSnapshotRationale(rationale: string, snapshot: MarketSnapshot | null) {
  if (!snapshot) {
    return rationale;
  }

  const snapshotNote = `系统已读取${snapshot.source}行情快照：${snapshot.name}（${snapshot.code}），当前价 ${snapshot.price.toFixed(2)} 元/股，总股本 ${snapshot.totalShares ? (snapshot.totalShares / 100000000).toFixed(4) : "待核对"} 亿股。该数据仅用于草稿填充，仍需用户核对。`;
  return rationale ? `${rationale}\n\n${snapshotNote}` : snapshotNote;
}

function appendFinancialRationale(rationale: string, snapshot: FinancialSnapshot | null, templateType: ValuationTemplateType) {
  if (!snapshot) {
    return rationale;
  }

  const latestAnnual = snapshot.yearly[0] ?? null;
  const basis = estimateBasisAmount(templateType, snapshot);
  const basisLabel = getTemplate(templateType).basisLabel;
  const financialNote = `系统已读取${snapshot.source}财务摘要：最近年报${latestAnnual?.reportType || "待核对"}归母净利润${formatYi(latestAnnual?.parentNetProfit ?? null)}亿元，自由现金流${formatYi(latestAnnual?.freeCashFlow ?? null)}亿元，ROE ${formatPercent(latestAnnual?.roe ?? null)}。本草稿按“${basisLabel}”估算起点约为 ${basis.base.toFixed(2)}，需要用户核对财报口径。`;
  return rationale ? `${rationale}\n\n${financialNote}` : financialNote;
}

function completeScenarioDrafts(
  templateType: ValuationTemplateType,
  scenarioMap: Map<string, z.infer<typeof scenarioDraftSchema>>,
  snapshot: MarketSnapshot | null,
  financialSnapshot: FinancialSnapshot | null
) {
  const basis = estimateBasisAmount(templateType, financialSnapshot);
  const growth = estimateGrowth(financialSnapshot);
  const multiple = estimateMultiple(templateType, snapshot);

  return scenarios.map((scenario) => {
    const existing = scenarioMap.get(scenario.value);
    const key = scenario.value;
    const defaultBasis = key === "bear" ? basis.bear : key === "base" ? basis.base : basis.bull;
    const defaultGrowth = key === "bear" ? growth.bear : key === "base" ? growth.base : growth.bull;
    const defaultMultiple = key === "bear" ? multiple.bear : key === "base" ? multiple.base : multiple.bull;
    const defaultNote = `${scenario.label}情景使用${basis.source}作为估值起点，并结合${growth.source}设置增长假设；该参数来自自动草稿，保存前需要核对财报、预测和估值倍数。`;

    return {
      name: scenario.value,
      basisAmount: existing && existing.basisAmount > 0 ? existing.basisAmount : round(defaultBasis, 2),
      growthRate: existing && existing.growthRate !== 0 ? existing.growthRate : round(defaultGrowth, 1),
      valuationMultiple: existing && existing.valuationMultiple > 0 ? existing.valuationMultiple : round(defaultMultiple, 1),
      discountRate: existing?.discountRate ?? (key === "bear" ? 12 : key === "base" ? 10 : 9),
      terminalGrowthRate: existing?.terminalGrowthRate ?? (key === "bull" ? 3 : 2),
      dividendYield: existing?.dividendYield ?? 0,
      notes: toChineseText(existing?.notes || defaultNote)
    };
  });
}

function estimateBasisAmount(templateType: ValuationTemplateType, snapshot: FinancialSnapshot | null) {
  const annualRecords = snapshot?.yearly ?? [];
  const latestAnnual = annualRecords[0] ?? snapshot?.latest ?? null;
  let base = 0;
  let source = "财务摘要";

  if (templateType === "financial") {
    base = latestAnnual?.bps ?? snapshot?.latest?.bps ?? 0;
    source = "最近报告每股净资产";
  } else if (templateType === "cyclical") {
    const profits = annualRecords.map((record) => record.parentNetProfit).filter(isUsableNumber).slice(0, 3);
    base = profits.length > 0 ? profits.reduce((sum, value) => sum + value, 0) / profits.length / 100000000 : 0;
    source = "最近三年归母净利润均值";
  } else if (templateType === "manufacturing") {
    base = (latestAnnual?.freeCashFlow || latestAnnual?.parentNetProfit || 0) / 100000000;
    source = latestAnnual?.freeCashFlow ? "最近年报自由现金流" : "最近年报归母净利润";
  } else {
    base = (latestAnnual?.parentNetProfit || 0) / 100000000;
    source = "最近年报归母净利润";
  }

  if (!Number.isFinite(base) || base <= 0) {
    base = 0;
  }

  const bearFactor = templateType === "financial" ? 0.95 : 0.85;
  const bullFactor = templateType === "financial" ? 1.05 : 1.15;

  return {
    source,
    bear: base * bearFactor,
    base,
    bull: base * bullFactor
  };
}

function estimateGrowth(snapshot: FinancialSnapshot | null) {
  const forecastGrowth = snapshot?.forecasts
    .filter((item) => item.yearMark === "E")
    .map((item) => item.parentNetProfitGrowth)
    .filter(isUsableNumber) ?? [];
  const latestAnnualGrowth = snapshot?.yearly[0]?.profitGrowth;
  const baseGrowth = forecastGrowth.length > 0
    ? forecastGrowth.reduce((sum, value) => sum + value, 0) / forecastGrowth.length
    : isUsableNumber(latestAnnualGrowth)
      ? latestAnnualGrowth
      : 5;

  return {
    source: forecastGrowth.length > 0 ? "机构预测利润增速" : "最近年报利润增速",
    bear: Math.max(-10, baseGrowth - 5),
    base: baseGrowth,
    bull: baseGrowth + 3
  };
}

function estimateMultiple(templateType: ValuationTemplateType, snapshot: MarketSnapshot | null) {
  if (templateType === "financial") {
    const pb = snapshot?.pb && snapshot.pb > 0 ? snapshot.pb : 1;
    return { bear: Math.max(0.5, pb * 0.8), base: pb, bull: pb * 1.2 };
  }

  if (templateType === "cyclical") {
    return { bear: 8, base: 10, bull: 12 };
  }

  const pe = snapshot?.peTtm && snapshot.peTtm > 0 ? snapshot.peTtm : templateType === "consumer" ? 15 : 12;
  return {
    bear: Math.max(8, pe * 0.8),
    base: pe,
    bull: pe * 1.2
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMetric(value: number | null) {
  return value && Number.isFinite(value) ? value.toFixed(2) : "无";
}

function formatYi(value: number | null) {
  return value && Number.isFinite(value) ? (value / 100000000).toFixed(2) : "无";
}

function formatPercent(value: number | null) {
  return value !== null && Number.isFinite(value) ? `${value.toFixed(2)}%` : "无";
}

function round(value: number, digits: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function isUsableNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value !== 0;
}

function toChineseText(value: string) {
  return value
    .replaceAll("templateType", "估值模板")
    .replaceAll("currentPrice", "当前价格")
    .replaceAll("sharesOutstanding", "总股本")
    .replaceAll("basisAmount", "估值起点")
    .replaceAll("dividendYield", "股息率")
    .replaceAll("discountRate", "折现率")
    .replaceAll("terminalGrowthRate", "永续增长率")
    .replaceAll("consumer", "消费股模板")
    .replaceAll("manufacturing", "制造业模板")
    .replaceAll("financial", "金融股模板")
    .replaceAll("cyclical", "周期股模板")
    .replaceAll("bear", "悲观")
    .replaceAll("base", "中性")
    .replaceAll("bull", "乐观");
}

function extractJson(content: string) {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("模型没有返回可解析的 JSON 草稿。");
    }

    return JSON.parse(match[0]) as unknown;
  }
}
