"use client";

import { RefreshCw, Search, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { companies } from "@/db/schema";
import type { MarketSnapshot, StockSearchResult } from "@/lib/market-data/types";

type Company = typeof companies.$inferSelect;

type SearchResponse = {
  ok?: boolean;
  message?: string;
  results?: StockSearchResult[];
};

type SnapshotResponse = {
  ok?: boolean;
  message?: string;
  snapshot?: MarketSnapshot;
};

export function MarketSnapshotLookup({ companies }: { companies: Company[] }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingSnapshot, setIsFetchingSnapshot] = useState(false);

  const matchingCompany = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    return companies.find((company) => stripCode(company.stockCode) === snapshot.code) ?? null;
  }, [companies, snapshot]);

  async function searchStocks() {
    const query = keyword.trim();
    if (!query || isSearching) {
      return;
    }

    setIsSearching(true);
    setMessage("");
    setSnapshot(null);

    try {
      const response = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
      const data = (await response.json()) as SearchResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "股票搜索失败。");
      }

      const nextResults = data.results ?? [];
      setResults(nextResults);
      if (nextResults.length === 0) {
        setMessage("没有搜索到 A 股公司，请换公司简称或 6 位代码试试。");
        return;
      }

      const exactMatch = nextResults.find((item) => item.code === query || item.secid === query);
      if (nextResults.length === 1 || exactMatch) {
        const target = exactMatch ?? nextResults[0];
        setMessage(`查询成功：${target.name}（${target.code}），正在获取估值快照...`);
        await fetchSnapshot(target, "查询成功，已自动获取估值快照。确认来源和时间后，可以填入当前表单。");
      } else {
        setMessage(`查询成功，找到 ${nextResults.length} 个结果。请选择目标公司后获取估值快照。`);
      }
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : "股票搜索失败。");
    } finally {
      setIsSearching(false);
    }
  }

  async function fetchSnapshot(item: StockSearchResult, successMessage = "已获取估值快照。确认来源和时间后，可以填入当前表单。") {
    if (isFetchingSnapshot) {
      return;
    }

    setIsFetchingSnapshot(true);
    setMessage("");

    try {
      const response = await fetch(`/api/market/snapshot?secid=${encodeURIComponent(item.secid)}`);
      const data = (await response.json()) as SnapshotResponse;
      if (!response.ok || !data.ok || !data.snapshot) {
        throw new Error(data.message ?? "估值快照获取失败。");
      }
      setSnapshot(data.snapshot);
      setMessage(successMessage);
    } catch (error) {
      setSnapshot(null);
      setMessage(error instanceof Error ? error.message : "估值快照获取失败。");
    } finally {
      setIsFetchingSnapshot(false);
    }
  }

  function applyToForm() {
    if (!snapshot) {
      return;
    }

    const form = findParentForm();
    if (!form) {
      setMessage("没有找到当前估值表单，请刷新页面后重试。");
      return;
    }

    setInputValue(form, "currentPrice", snapshot.price ? snapshot.price.toFixed(2) : "");
    setInputValue(form, "sharesOutstanding", snapshot.totalShares ? (snapshot.totalShares / 100000000).toFixed(4) : "");

    if (matchingCompany) {
      setInputValue(form, "companyId", matchingCompany.id);
    }

    const notes = [
      `行情快照来源：${snapshot.source}`,
      `公司：${snapshot.name}（${snapshot.code}）`,
      `获取时间：${formatDateTime(snapshot.fetchedAt)}`,
      `当前价：${formatNumber(snapshot.price)} 元/股`,
      `PE TTM：${formatOptionalNumber(snapshot.peTtm)}`,
      `PB：${formatOptionalNumber(snapshot.pb)}`,
      `总市值：${formatYi(snapshot.totalMarketCap)} 亿元`,
      `总股本：${snapshot.totalShares ? (snapshot.totalShares / 100000000).toFixed(4) : "待核对"} 亿股`,
      "状态：待用户核对后用于估值，不构成投资建议。"
    ];
    appendTextareaValue(form, "userNotes", notes.join("\n"));
    setMessage("已填入当前价格、总股本和资料来源。三情景关键假设仍需要手动确认。");
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="block flex-1">
          <span className="text-sm font-semibold">行情取数助手</span>
          <div className="mt-2 flex rounded-md border border-border bg-background focus-within:border-primary">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  searchStocks();
                }
              }}
              placeholder="输入公司简称或代码，例如：美的集团 / 000333"
              className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={searchStocks}
              disabled={isSearching || keyword.trim().length === 0}
              className="inline-flex items-center gap-2 border-l border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
              查询
            </button>
          </div>
        </label>
        <button
          type="button"
          onClick={applyToForm}
          disabled={!snapshot}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Wand2 className="h-4 w-4" aria-hidden />
          填入表单
        </button>
      </div>

      {results.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {results.map((item) => (
            <button
              key={item.secid}
              type="button"
              onClick={() => fetchSnapshot(item)}
              disabled={isFetchingSnapshot}
              className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition hover:bg-muted disabled:opacity-50"
            >
              <span className="font-semibold">{item.name}</span>
              <span className="ml-2 text-muted-foreground">{item.code}</span>
              <span className="ml-2 text-xs text-muted-foreground">{item.marketName}</span>
            </button>
          ))}
        </div>
      ) : null}

      {snapshot ? (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <SnapshotMetric label="当前价" value={`${formatNumber(snapshot.price)} 元`} />
          <SnapshotMetric label="PE TTM" value={formatOptionalNumber(snapshot.peTtm)} />
          <SnapshotMetric label="PB" value={formatOptionalNumber(snapshot.pb)} />
          <SnapshotMetric label="总股本" value={`${snapshot.totalShares ? (snapshot.totalShares / 100000000).toFixed(2) : "待核对"} 亿股`} />
        </div>
      ) : null}

      {snapshot?.warnings.length ? (
        <ul className="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
          {snapshot.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}

function SnapshotMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs font-semibold text-primary">{label}</div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function findParentForm() {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    const form = active.closest("form");
    if (form instanceof HTMLFormElement) {
      return form;
    }
  }
  const lookup = document.querySelector("[data-market-snapshot-lookup-active]");
  const form = lookup?.closest("form");
  return form instanceof HTMLFormElement ? form : null;
}

function setInputValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function appendTextareaValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLTextAreaElement)) {
    return;
  }

  field.value = field.value.trim() ? `${field.value.trim()}\n\n${value}` : value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

function stripCode(value: string) {
  return value.toUpperCase().replace(/^SH|^SZ|^BJ|\.(SH|SZ|BJ)$/g, "");
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

function formatNumber(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return "待核对";
  }
  return value.toFixed(2);
}

function formatOptionalNumber(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return "待核对";
  }
  return value.toFixed(2);
}

function formatYi(value: number | null) {
  if (!value || !Number.isFinite(value)) {
    return "待核对";
  }
  return (value / 100000000).toFixed(2);
}
