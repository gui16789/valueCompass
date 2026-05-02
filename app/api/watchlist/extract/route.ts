import { NextResponse } from "next/server";
import { z } from "zod";
import { callOpenAICompatibleChat } from "@/lib/ai/openai-compatible";
import { decryptSecret } from "@/lib/encryption/crypto";
import { getModelProviderForRole } from "@/lib/model-config/queries";
import { companyTypes } from "@/lib/watchlist/constants";

const extractRequestSchema = z.object({
  company: z.object({
    stockCode: z.string().trim().min(1),
    stockName: z.string().trim().min(1),
    industry: z.string().trim().optional(),
    companyType: z.string().trim().optional(),
    description: z.string().trim().optional(),
    thesis: z.string().trim().optional(),
    keyRisks: z.string().trim().optional(),
    nextAction: z.string().trim().optional()
  }),
  sourceText: z.string().trim().min(80, "请至少粘贴 80 个字的资料。").max(12000, "单次资料不能超过 12000 字。")
});

const extractResponseSchema = z.object({
  industry: z.string().trim().default(""),
  companyType: z.string().trim().default("other"),
  description: z.string().trim().default(""),
  thesis: z.string().trim().default(""),
  keyRisks: z.string().trim().default(""),
  nextAction: z.string().trim().default(""),
  facts: z.array(z.string().trim()).default([]),
  inferences: z.array(z.string().trim()).default([]),
  opinions: z.array(z.string().trim()).default([]),
  toVerify: z.array(z.string().trim()).default([])
});

const allowedCompanyTypeValues = companyTypes.map((type) => type.value).join(", ");

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = extractRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "请求格式不正确。"
      },
      { status: 400 }
    );
  }

  try {
    const modelConfig = await getModelProviderForRole("research_assistant");

    if (!modelConfig) {
      throw new Error("还没有可用的模型配置。请先到设置页新增并测试模型提供商。");
    }

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
          content: `你是 A 股价值投资研究助理。你的任务是从用户粘贴的资料中提取结构化研究草稿。

严格规则：
- 只返回 JSON，不要使用 Markdown。
- 不输出买入、卖出、持有、目标价、仓位建议。
- 区分事实、推断、观点和待确认事项。
- 不要编造资料中没有的信息；不确定就写入 toVerify。
- companyType 只能从这些值选择：${allowedCompanyTypeValues}。
- nextAction 应该是研究动作，例如阅读年报、核对财务数据、补估值、验证风险，不是交易动作。

JSON 字段：
{
  "industry": "",
  "companyType": "consumer|financial|cyclical|manufacturing|healthcare|technology|other",
  "description": "",
  "thesis": "",
  "keyRisks": "",
  "nextAction": "",
  "facts": [],
  "inferences": [],
  "opinions": [],
  "toVerify": []
}`
        },
        {
          role: "user",
          content: `公司上下文：
股票代码：${parsed.data.company.stockCode}
公司名称：${parsed.data.company.stockName}
已有行业：${parsed.data.company.industry || "未填写"}
已有公司类型：${parsed.data.company.companyType || "未填写"}
已有简介：${parsed.data.company.description || "未填写"}
已有投资假设：${parsed.data.company.thesis || "未填写"}
已有关键风险：${parsed.data.company.keyRisks || "未填写"}
已有下一步行动：${parsed.data.company.nextAction || "未填写"}

用户粘贴资料：
${parsed.data.sourceText}`
        }
      ]
    });

    const json = extractJson(rawContent);
    const extracted = extractResponseSchema.parse(json);
    const normalizedCompanyType = companyTypes.some((type) => type.value === extracted.companyType)
      ? extracted.companyType
      : "other";

    return NextResponse.json({
      ok: true,
      draft: {
        ...extracted,
        companyType: normalizedCompanyType
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "AI 资料提取失败。"
      },
      { status: 500 }
    );
  }
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
