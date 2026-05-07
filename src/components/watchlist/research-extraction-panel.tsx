"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { PendingButton } from "@/components/ui/pending-button";
import type { companies } from "@/db/schema";
import { companyTypes, labelFor } from "@/lib/watchlist/constants";

type Company = typeof companies.$inferSelect;

type ExtractionDraft = {
  industry: string;
  companyType: string;
  description: string;
  thesis: string;
  keyRisks: string;
  nextAction: string;
  facts: string[];
  inferences: string[];
  opinions: string[];
  toVerify: string[];
};

export function ResearchExtractionPanel({
  companies,
  applyAction
}: {
  companies: Company[];
  applyAction: (formData: FormData) => Promise<void>;
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<ExtractionDraft | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [message, setMessage] = useState("");
  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyId) ?? companies[0],
    [companies, companyId]
  );

  async function extractDraft() {
    if (!selectedCompany || isExtracting) {
      return;
    }

    setIsExtracting(true);
    setMessage("");
    setDraft(null);

    try {
      const response = await fetch("/api/watchlist/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company: {
            stockCode: selectedCompany.stockCode,
            stockName: selectedCompany.stockName,
            industry: selectedCompany.industry,
            companyType: selectedCompany.companyType,
            description: selectedCompany.description,
            thesis: selectedCompany.thesis,
            keyRisks: selectedCompany.keyRisks,
            nextAction: selectedCompany.nextAction
          },
          sourceText
        })
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        draft?: ExtractionDraft;
      };

      if (!response.ok || !data.ok || !data.draft) {
        throw new Error(data.message ?? "AI 资料提取失败。");
      }

      setDraft(data.draft);
      setMessage("已生成待确认草稿。请先检查，再决定是否应用到公司记录。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 资料提取失败。");
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <section className="page-panel rounded-lg p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">AI 资料提取</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            粘贴年报、公告、新闻、研报摘要或你的笔记，让 AI 生成待确认草稿。资料会发送给你配置的模型提供商；AI 不会自动覆盖记录。
          </p>
        </div>
        <div className="status-chip status-chip-warn rounded-md">
          事实 / 推断 / 观点 / 待确认分开展示
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
          先新增一家公司，再使用 AI 资料提取。
        </div>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
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
              <span className="text-sm font-semibold">粘贴资料</span>
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                rows={9}
                placeholder="粘贴年报段落、公告摘要、新闻、研报摘要或你的研究笔记。"
                className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={extractDraft}
              disabled={!selectedCompany || sourceText.trim().length < 80 || isExtracting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <Bot className="h-4 w-4" aria-hidden />
              {isExtracting ? "提取中..." : "生成待确认草稿"}
            </button>
            {message ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
                {message}
              </div>
            ) : null}
          </div>

          <DraftPreview companyId={selectedCompany?.id ?? ""} draft={draft} applyAction={applyAction} />
        </div>
      )}
    </section>
  );
}

function DraftPreview({
  companyId,
  draft,
  applyAction
}: {
  companyId: string;
  draft: ExtractionDraft | null;
  applyAction: (formData: FormData) => Promise<void>;
}) {
  if (!draft) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold">草稿会显示在这里</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              提取结果不会自动写入公司记录。你可以先阅读事实和待确认事项，再决定是否应用。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <DraftField title="行业" value={draft.industry || "未识别"} />
        <DraftField title="公司类型" value={labelFor(companyTypes, draft.companyType)} />
        <DraftField title="公司简介" value={draft.description || "未提取"} />
        <DraftField title="投资假设草稿" value={draft.thesis || "未提取"} />
        <DraftField title="关键风险草稿" value={draft.keyRisks || "未提取"} />
        <DraftField title="下一步行动" value={draft.nextAction || "未提取"} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ListBlock title="事实" items={draft.facts} />
        <ListBlock title="推断" items={draft.inferences} />
        <ListBlock title="观点" items={draft.opinions} />
        <ListBlock title="待确认" items={draft.toVerify} />
      </div>

      <form action={applyAction}>
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="industry" value={draft.industry} />
        <input type="hidden" name="companyType" value={draft.companyType} />
        <input type="hidden" name="description" value={draft.description} />
        <input type="hidden" name="thesis" value={draft.thesis} />
        <input type="hidden" name="keyRisks" value={draft.keyRisks} />
        <input type="hidden" name="nextAction" value={draft.nextAction} />
        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="应用中..."
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          应用到公司记录
        </PendingButton>
      </form>
    </div>
  );
}

function DraftField({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs font-semibold text-primary">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs font-semibold text-primary">{title}</div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">无</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
