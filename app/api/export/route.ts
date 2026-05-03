import { NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  aiConversations,
  aiMessages,
  checklistRuns,
  companies,
  customChecklistTemplates,
  decisions,
  investmentPrinciples,
  knowledgeNodes,
  modelConfigs,
  modelProviders,
  reviews,
  valuations
} from "@/db/schema";

export async function GET() {
  const [
    providerRows,
    configRows,
    conversationRows,
    messageRows,
    knowledgeRows,
    companyRows,
    principleRows,
    checklistTemplateRows,
    checklistRunRows,
    decisionRows,
    valuationRows,
    reviewRows
  ] = await Promise.all([
    db
      .select({
        id: modelProviders.id,
        name: modelProviders.name,
        apiBaseUrl: modelProviders.apiBaseUrl,
        isOpenAICompatible: modelProviders.isOpenAICompatible,
        allowInsecureTls: modelProviders.allowInsecureTls,
        defaultModelName: modelProviders.defaultModelName,
        defaultTemperature: modelProviders.defaultTemperature,
        maxContextTokens: modelProviders.maxContextTokens,
        status: modelProviders.status,
        lastTestStatus: modelProviders.lastTestStatus,
        lastTestMessage: modelProviders.lastTestMessage,
        lastTestedAt: modelProviders.lastTestedAt,
        createdAt: modelProviders.createdAt,
        updatedAt: modelProviders.updatedAt
      })
      .from(modelProviders),
    db.select().from(modelConfigs),
    db.select().from(aiConversations),
    db.select().from(aiMessages),
    db.select().from(knowledgeNodes),
    db.select().from(companies),
    db.select().from(investmentPrinciples),
    db.select().from(customChecklistTemplates),
    db.select().from(checklistRuns),
    db.select().from(decisions),
    db.select().from(valuations),
    db.select().from(reviews)
  ]);

  const exportedAt = new Date().toISOString();
  const payload = {
    app: "Value Compass",
    version: 1,
    exportedAt,
    notice: "导出文件不包含模型 API Key；仍可能包含你的研究记录、决策和复盘内容，请妥善保存。",
    data: {
      modelProviders: providerRows,
      modelConfigs: configRows,
      aiConversations: conversationRows,
      aiMessages: messageRows,
      knowledgeNodes: knowledgeRows,
      companies: companyRows,
      investmentPrinciples: principleRows,
      customChecklistTemplates: checklistTemplateRows,
      checklistRuns: checklistRunRows,
      decisions: decisionRows,
      valuations: valuationRows,
      reviews: reviewRows
    }
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="value-compass-export-${exportedAt.slice(0, 10)}.json"`
    }
  });
}
