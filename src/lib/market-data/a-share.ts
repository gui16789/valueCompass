export type NormalizedAStockCode = {
  raw: string;
  prefixed: string;
  exchange: "SH" | "SZ" | "BJ" | "UNKNOWN";
  secid: string;
};

export function normalizeAStockCode(input: string): NormalizedAStockCode | null {
  const cleaned = input.trim().replace(/\s+/g, "").toLowerCase();
  if (!cleaned) {
    return null;
  }

  const prefixedMatch = /^(sh|sz|bj)(\d{6})$/.exec(cleaned);
  const suffixMatch = /^(\d{6})\.(sh|sz|bj)$/i.exec(cleaned);
  const rawMatch = /^(\d{6})$/.exec(cleaned);

  let raw = "";
  let prefix = "";

  if (prefixedMatch) {
    prefix = prefixedMatch[1];
    raw = prefixedMatch[2];
  } else if (suffixMatch) {
    raw = suffixMatch[1];
    prefix = suffixMatch[2].toLowerCase();
  } else if (rawMatch) {
    raw = rawMatch[1];
    prefix = inferPrefix(raw);
  }

  if (!raw || !prefix) {
    return null;
  }

  const marketId = prefix === "sh" ? "1" : "0";

  return {
    raw,
    prefixed: `${prefix}${raw}`,
    exchange: prefix.toUpperCase() as NormalizedAStockCode["exchange"],
    secid: `${marketId}.${raw}`
  };
}

export function exchangeName(exchange: NormalizedAStockCode["exchange"]) {
  switch (exchange) {
    case "SH":
      return "上海";
    case "SZ":
      return "深圳";
    case "BJ":
      return "北京";
    default:
      return "未知";
  }
}

function inferPrefix(raw: string) {
  if (raw.startsWith("6")) {
    return "sh";
  }
  if (raw.startsWith("4") || raw.startsWith("8")) {
    return "bj";
  }
  if (raw.startsWith("0") || raw.startsWith("3")) {
    return "sz";
  }
  return "";
}
