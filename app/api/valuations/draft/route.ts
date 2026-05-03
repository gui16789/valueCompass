import { NextResponse } from "next/server";
import { z } from "zod";
import { callOpenAICompatibleChat } from "@/lib/ai/openai-compatible";
import { decryptSecret } from "@/lib/encryption/crypto";
import { getModelProviderForRole } from "@/lib/model-config/queries";
import { getTemplate, scenarios, valuationTemplates } from "@/lib/valuations/constants";

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
  sourceText: z.string().trim().min(40, "请至少粘贴 40 个字的财务摘要或研究资料。").max(16000, "单次资料不能超过 16000 字。")
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
- 所有数字必须来自用户资料、用户明确给出的上下文，或写成保守的待确认占位。不能联网搜索。
- 如果资料缺少当前价格、总股本或估值起点，填 0，并在 cautions 写清需要人工补充。
- growthRate、discountRate、terminalGrowthRate、dividendYield 使用百分数，例如 5 表示 5%，不要用 0.05。
- sharesOutstanding 单位是亿股；currentPrice 单位是元/股。
- financial 模板 basisAmount 是每股净资产，cyclical/consumer/manufacturing 模板 basisAmount 单位是亿元。
- templateType 只能是：${allowedTemplateValues}。情景只能是：${scenarioLabels}。
- 三个情景必须按 bear、base、bull 各返回一个。
- notes 必须说明该情景依赖的关键假设和待确认事项。

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

用户粘贴资料：
${parsed.data.sourceText}`
        }
      ]
    });

    const extracted = draftResponseSchema.parse(extractJson(rawContent));

    return NextResponse.json({
      ok: true,
      draft: normalizeDraft(extracted, parsed.data.templateType)
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

function normalizeDraft(draft: z.infer<typeof draftResponseSchema>, fallbackTemplateType: z.infer<typeof draftRequestSchema>["templateType"]) {
  const scenarioMap = new Map(draft.scenarios.map((scenario) => [scenario.name, scenario]));

  return {
    ...draft,
    templateType: draft.templateType || fallbackTemplateType,
    scenarios: scenarios.map((scenario) => ({
      name: scenario.value,
      basisAmount: scenarioMap.get(scenario.value)?.basisAmount ?? 0,
      growthRate: scenarioMap.get(scenario.value)?.growthRate ?? 0,
      valuationMultiple: scenarioMap.get(scenario.value)?.valuationMultiple ?? 0,
      discountRate: scenarioMap.get(scenario.value)?.discountRate ?? (scenario.value === "bear" ? 12 : scenario.value === "base" ? 10 : 9),
      terminalGrowthRate: scenarioMap.get(scenario.value)?.terminalGrowthRate ?? (scenario.value === "bull" ? 3 : 2),
      dividendYield: scenarioMap.get(scenario.value)?.dividendYield ?? 0,
      notes: scenarioMap.get(scenario.value)?.notes ?? ""
    }))
  };
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
