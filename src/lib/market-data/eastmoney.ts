import https from "node:https";
import { exchangeName, normalizeAStockCode } from "./a-share";
import type { FinancialIndicatorRecord, FinancialSnapshot, InstitutionForecastRecord, MarketSnapshot, StockSearchResult } from "./types";

const EASTMONEY_SOURCE = "东方财富";
const SEARCH_URL = "https://searchapi.eastmoney.com/api/suggest/get";
const QUOTE_URL = "https://push2.eastmoney.com/api/qt/stock/get";
const OPERATIONS_REQUIRED_URL = "https://emweb.securities.eastmoney.com/PC_HSF10/OperationsRequired/PageAjax";
const DATA_CENTER_V1_URL = "https://datacenter.eastmoney.com/securities/api/data/v1/get";
const FINANCE_DATA_URL = "https://datacenter.eastmoney.com/securities/api/data/get";
const SEARCH_TOKEN = "44c9d251add88e27b65ed86506f6e5da";

type EastmoneySearchItem = {
  Code?: string;
  Name?: string;
  Classify?: string;
  SecurityTypeName?: string;
  QuoteID?: string;
};

type EastmoneySearchResponse = {
  QuotationCodeTable?: {
    Data?: EastmoneySearchItem[];
  };
};

type EastmoneyQuoteResponse = {
  rc?: number;
  data?: Record<string, unknown> | null;
};

type EastmoneyDataCenterResponse = {
  result?: {
    data?: Record<string, unknown>[];
  };
};

type EastmoneyOperationsResponse = {
  zxzb?: unknown;
  yctj_chart?: unknown;
};

export async function searchEastmoneyStocks(keyword: string, limit = 8): Promise<StockSearchResult[]> {
  const query = keyword.trim();
  if (query.length < 1) {
    return [];
  }

  const url = new URL(SEARCH_URL);
  url.searchParams.set("input", query);
  url.searchParams.set("type", "14");
  url.searchParams.set("token", SEARCH_TOKEN);

  const payload = await fetchEastmoneyJson<EastmoneySearchResponse>(url, "https://www.eastmoney.com/", 60 * 60 * 24);
  const rows = payload.QuotationCodeTable?.Data ?? [];

  return rows
    .filter((item) => item.Classify === "AStock" && item.Code && item.Name && item.QuoteID)
    .slice(0, limit)
    .map((item) => {
      const normalized = normalizeAStockCode(item.Code ?? "");
      const exchange = normalized?.exchange ?? exchangeFromQuoteId(item.QuoteID ?? "");

      return {
        code: item.Code ?? "",
        name: item.Name ?? "",
        exchange,
        marketName: item.SecurityTypeName ?? exchangeName(exchange),
        secid: item.QuoteID ?? normalized?.secid ?? "",
        source: EASTMONEY_SOURCE
      };
    });
}

export async function getEastmoneyMarketSnapshot(input: string): Promise<MarketSnapshot> {
  const secid = input.includes(".") && /^\d+\.\d{6}$/.test(input.trim())
    ? input.trim()
    : normalizeAStockCode(input)?.secid;

  if (!secid) {
    throw new Error("无法识别 A 股代码，请输入 6 位代码、sh/sz/bj 前缀代码或搜索结果。");
  }

  const url = new URL(QUOTE_URL);
  url.searchParams.set("secid", secid);
  url.searchParams.set("fields", "f43,f44,f45,f47,f57,f58,f60,f84,f85,f116,f117,f162,f163");

  const payload = await fetchEastmoneyJson<EastmoneyQuoteResponse>(url, "https://quote.eastmoney.com/", 30);
  const data = payload.data;
  if (payload.rc !== 0 || !data) {
    throw new Error("估值快照数据为空。");
  }

  const code = toString(data.f57);
  const normalized = normalizeAStockCode(code);
  const price = scaleQuotePrice(toNumber(data.f43));
  const high = scaleQuotePrice(toNumber(data.f44));
  const low = scaleQuotePrice(toNumber(data.f45));
  const preClose = scaleQuotePrice(toNumber(data.f60));
  const volume = toNumber(data.f47);
  const totalShares = toNumber(data.f84);
  const floatShares = toNumber(data.f85) || totalShares;
  const fetchedAt = new Date().toISOString();
  const warnings: string[] = [];

  if (!price) {
    warnings.push("当前价格为空，可能处于停牌、未开盘或上游数据异常状态。");
  }
  if (!totalShares) {
    warnings.push("总股本为空，保存估值前需要手动核对。");
  }

  return {
    code,
    name: toString(data.f58),
    exchange: normalized?.exchange ?? exchangeFromQuoteId(secid),
    secid,
    price,
    peTtm: scaleQuoteValue(toNumber(data.f162), 0.01),
    pb: scaleQuoteValue(toNumber(data.f163), 0.001),
    totalMarketCap: toNumber(data.f116) || null,
    floatMarketCap: toNumber(data.f117) || null,
    totalShares: totalShares || null,
    floatShares: floatShares || null,
    turnoverRate: floatShares > 0 && volume > 0 ? (volume * 10000) / floatShares : null,
    amplitude: preClose > 0 && high > 0 && low > 0 ? ((high - low) / preClose) * 100 : null,
    asOf: fetchedAt,
    fetchedAt,
    source: EASTMONEY_SOURCE,
    sourceUrl: url.toString(),
    warnings
  };
}

export async function getEastmoneyFinancialSnapshot(input: string): Promise<FinancialSnapshot> {
  const normalized = normalizeAStockCode(input);

  if (!normalized) {
    throw new Error("无法识别 A 股代码，请输入 6 位代码、sh/sz/bj 前缀代码或搜索结果。");
  }

  const secuCode = `${normalized.raw}.${normalized.exchange}`;
  const operationsUrl = new URL(OPERATIONS_REQUIRED_URL);
  operationsUrl.searchParams.set("code", `${normalized.exchange}${normalized.raw}`);

  const [operations, mainIndicators] = await Promise.all([
    fetchEastmoneyJson<EastmoneyOperationsResponse>(operationsUrl, "https://emweb.securities.eastmoney.com/", 60 * 30),
    fetchMainIndicators(secuCode, normalized.raw)
  ]);

  const operationIndicators = toRecordArray(operations.zxzb).map(normalizeIndicatorRecord);
  const primaryRecords = mainIndicators.map(normalizeIndicatorRecord);
  const allRecords = mergeIndicatorRecords([...primaryRecords, ...operationIndicators]);
  const yearly = allRecords.filter((record) => isAnnualReport(record.reportType)).slice(0, 5);
  const quarterly = allRecords.filter((record) => !isAnnualReport(record.reportType)).slice(0, 8);
  const latest = allRecords[0] ?? null;
  const forecasts = toRecordArray(operations.yctj_chart).map(normalizeForecastRecord).filter((item) => item.year > 0).slice(0, 4);
  const warnings: string[] = [];

  if (!latest) {
    warnings.push("未获取到最新主要财务指标。");
  }
  if (yearly.length === 0) {
    warnings.push("未获取到最近年报指标，估值起点需要人工核对。");
  }
  if (forecasts.length === 0) {
    warnings.push("未获取到机构预测摘要，未来增长假设需要人工填写。");
  }

  return {
    code: normalized.raw,
    name: toString(allRecordsSourceName(mainIndicators) || firstRecordValue(toRecordArray(operations.zxzb), "SECURITY_NAME_ABBR")),
    latest,
    yearly,
    quarterly,
    forecasts,
    source: EASTMONEY_SOURCE,
    sourceUrl: operationsUrl.toString(),
    fetchedAt: new Date().toISOString(),
    warnings
  };
}

async function fetchMainIndicators(secuCode: string, rawCode: string) {
  let primaryRecords: Record<string, unknown>[] = [];
  const primaryUrl = new URL(DATA_CENTER_V1_URL);
  primaryUrl.searchParams.set("reportName", "RPT_PCF10_FINANCEMAINFINADATA");
  primaryUrl.searchParams.set("columns", "ALL");
  primaryUrl.searchParams.set("filter", `(SECUCODE="${secuCode}")`);
  primaryUrl.searchParams.set("pageNumber", "1");
  primaryUrl.searchParams.set("pageSize", "24");
  primaryUrl.searchParams.set("sortColumns", "REPORT_DATE");
  primaryUrl.searchParams.set("sortTypes", "-1");
  primaryUrl.searchParams.set("source", "HSF10");
  primaryUrl.searchParams.set("client", "PC");

  try {
    const primary = await fetchEastmoneyJson<EastmoneyDataCenterResponse>(primaryUrl, "https://emweb.securities.eastmoney.com/", 60 * 30);
    primaryRecords = primary.result?.data ?? [];
  } catch {
    primaryRecords = [];
  }

  const fallbackUrl = new URL(FINANCE_DATA_URL);
  fallbackUrl.searchParams.set("type", "RPT_F10_FINANCE_MAINFINADATA");
  fallbackUrl.searchParams.set("sty", "APP_F10_MAINFINADATA");
  fallbackUrl.searchParams.set("filter", `(SECURITY_CODE="${rawCode}")`);
  fallbackUrl.searchParams.set("p", "1");
  fallbackUrl.searchParams.set("ps", "16");
  fallbackUrl.searchParams.set("st", "REPORT_DATE");
  fallbackUrl.searchParams.set("sr", "-1");

  const fallback = await fetchEastmoneyJson<EastmoneyDataCenterResponse>(fallbackUrl, "https://emweb.securities.eastmoney.com/", 60 * 30);
  return [...primaryRecords, ...(fallback.result?.data ?? [])];
}

function eastmoneyHeaders(referer: string) {
  return {
    Referer: referer,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  };
}

export async function fetchEastmoneyJson<T>(url: URL, referer: string, revalidate: number): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: eastmoneyHeaders(referer),
      next: { revalidate }
    });

    if (!response.ok) {
      throw new Error(`东方财富请求失败：${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (!isCertificateError(error) || !isEastmoneyHost(url.hostname)) {
      throw error;
    }

    return fetchEastmoneyJsonWithInsecureTls<T>(url, referer);
  }
}

function fetchEastmoneyJsonWithInsecureTls<T>(url: URL, referer: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: eastmoneyHeaders(referer),
        rejectUnauthorized: false,
        timeout: 8000
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`东方财富请求失败：${response.statusCode ?? "unknown"}`));
            return;
          }

          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as T);
          } catch {
            reject(new Error("东方财富响应不是有效 JSON。"));
          }
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("东方财富请求超时。"));
    });
    request.on("error", reject);
  });
}

function isEastmoneyHost(hostname: string) {
  return hostname === "eastmoney.com" || hostname.endsWith(".eastmoney.com");
}

function isCertificateError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  return (
    error.message.includes("certificate") ||
    (cause instanceof Error && (cause.message.includes("certificate") || cause.message.includes("local issuer")))
  );
}

function exchangeFromQuoteId(value: string): StockSearchResult["exchange"] {
  if (value.startsWith("1.")) {
    return "SH";
  }
  if (value.startsWith("0.")) {
    return "SZ";
  }
  return "UNKNOWN";
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    if (value.every((item) => isRecord(item))) {
      return value as Record<string, unknown>[];
    }
    return value.flatMap((item) => toRecordArray(item));
  }

  if (isRecord(value)) {
    const data = value.data;
    return toRecordArray(data);
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeIndicatorRecord(row: Record<string, unknown>): FinancialIndicatorRecord {
  return {
    reportDate: toString(row.REPORT_DATE),
    reportType: toString(row.REPORT_TYPE || row.REPORT_DATE_NAME),
    revenue: firstNumber(row, ["TOTAL_OPERATEINCOME", "TOTALOPERATEREVE", "TOTAL_OPERATE_INCOME"]),
    parentNetProfit: firstNumber(row, ["PARENT_NETPROFIT", "PARENTNETPROFIT"]),
    deductedNetProfit: firstNumber(row, ["KCFJCXSYJLR"]),
    eps: firstNumber(row, ["EPSJB", "EPSXS"]),
    bps: firstNumber(row, ["BPS", "BPS_PL"]),
    operatingCashFlowPerShare: firstNumber(row, ["MGJYXJJE"]),
    grossMargin: firstNumber(row, ["XSMLL"]),
    netMargin: firstNumber(row, ["XSJLL"]),
    roe: firstNumber(row, ["ROEJQ"]),
    roic: firstNumber(row, ["ROIC"]),
    debtToAssetRatio: firstNumber(row, ["ZCFZL"]),
    revenueGrowth: firstNumber(row, ["TOTALOPERATEREVETZ", "YYZSRGDHBZC"]),
    profitGrowth: firstNumber(row, ["PARENTNETPROFITTZ", "NETPROFITRPHBZC"]),
    freeCashFlow: firstNumber(row, ["FCFF_FORWARD", "FCFF_BACK"])
  };
}

function normalizeForecastRecord(row: Record<string, unknown>): InstitutionForecastRecord {
  return {
    year: firstNumber(row, ["YEAR"]) ?? 0,
    yearMark: toString(row.YEAR_MARK),
    eps: firstNumber(row, ["EPS"]),
    pe: firstNumber(row, ["PE"]),
    roe: firstNumber(row, ["ROE"]),
    parentNetProfit: firstNumber(row, ["PARENT_NETPROFIT"]),
    parentNetProfitGrowth: firstNumber(row, ["PARENT_NETPROFIT_RATIO"]),
    revenue: firstNumber(row, ["TOTAL_OPERATE_INCOME"]),
    revenueGrowth: firstNumber(row, ["TOTAL_OPERATE_INCOME_RATIO"])
  };
}

function firstNumber(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = toNumber(row[key]);
    if (value !== 0) {
      return value;
    }
  }
  return null;
}

function mergeIndicatorRecords(records: FinancialIndicatorRecord[]) {
  const seen = new Set<string>();
  return records
    .filter((record) => record.reportDate || record.reportType)
    .sort((a, b) => b.reportDate.localeCompare(a.reportDate))
    .filter((record) => {
      const key = `${record.reportDate}:${record.reportType}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function isAnnualReport(reportType: string) {
  return reportType.includes("年报") || reportType.includes("年度");
}

function allRecordsSourceName(rows: Record<string, unknown>[]) {
  return firstRecordValue(rows, "SECURITY_NAME_ABBR");
}

function firstRecordValue(rows: Record<string, unknown>[], key: string) {
  return rows.find((row) => toString(row[key]))?.[key] ?? "";
}

function scaleQuotePrice(value: number) {
  return value > 0 ? value / 100 : 0;
}

function scaleQuoteValue(value: number, scale: number) {
  return value > 0 ? value * scale : null;
}
