"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type SensitivityPoint = {
  name: string;
  valuePerShare: number;
  marginOfSafety: number;
  impliedUpside: number;
};

type SensitivityMatrix = {
  rowAxisLabel: string;
  columnAxisLabel: string;
  rows: string[];
  columns: string[];
  cells: Array<{
    rowLabel: string;
    columnLabel: string;
    valuePerShare: number;
    marginOfSafety: number;
  }>;
};

export default function SensitivityChart({
  data,
  currentPrice,
  matrix
}: {
  data: SensitivityPoint[];
  currentPrice: number;
  matrix?: SensitivityMatrix;
}) {
  if (data.length === 0) {
    return null;
  }

  const sortedValues = data.map((item) => item.valuePerShare).sort((a, b) => a - b);
  const low = sortedValues[0] ?? 0;
  const high = sortedValues[sortedValues.length - 1] ?? 0;
  const base = data.find((item) => item.name === "中性") ?? data[1] ?? data[0];

  return (
    <div className="mt-4 rounded-md border border-border bg-card p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold text-primary">估值敏感性视图</div>
          <div className="mt-1 text-xs text-muted-foreground">
            区间 {formatNumber(low)} - {formatNumber(high)} 元/股，中性安全边际 {formatPercent(base.marginOfSafety)}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">虚线为当前价格</div>
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              formatter={(value) => [`${Number(value).toFixed(2)} 元/股`, "每股估值"]}
              labelFormatter={(label) => `${label}情景`}
              contentStyle={{
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))"
              }}
            />
            {currentPrice > 0 ? (
              <ReferenceLine
                y={currentPrice}
                stroke="hsl(var(--primary))"
                strokeDasharray="4 4"
                label={{
                  value: `当前 ${currentPrice.toFixed(2)}`,
                  fill: "hsl(var(--primary))",
                  fontSize: 12,
                  position: "insideTopRight"
                }}
              />
            ) : null}
            <Bar dataKey="valuePerShare" radius={[4, 4, 0, 0]}>
              {data.map((item) => (
                <Cell key={item.name} fill={colorForMargin(item.marginOfSafety)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="rounded-md border border-border bg-background p-3">
            <div className="text-xs font-semibold text-primary">{item.name}情景</div>
            <div className="mt-2 text-sm font-semibold">{formatNumber(item.valuePerShare)} 元/股</div>
            <div className="mt-1 text-xs text-muted-foreground">
              安全边际 {formatPercent(item.marginOfSafety)} / 隐含涨跌 {formatPercent(item.impliedUpside)}
            </div>
          </div>
        ))}
      </div>

      {matrix && matrix.rows.length > 0 && matrix.columns.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-md border border-border bg-background">
          <div className="border-b border-border px-3 py-2 text-xs font-semibold text-primary">
            中性情景关键变量矩阵：{matrix.rowAxisLabel} x {matrix.columnAxisLabel}
          </div>
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-r border-border px-3 py-2 text-left text-xs text-muted-foreground">
                  {matrix.rowAxisLabel} \\ {matrix.columnAxisLabel}
                </th>
                {matrix.columns.map((column) => (
                  <th key={column} className="border-b border-border px-3 py-2 text-left text-xs text-muted-foreground">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row}>
                  <th className="border-r border-border px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                    {row}
                  </th>
                  {matrix.columns.map((column) => {
                    const cell = matrix.cells.find((item) => item.rowLabel === row && item.columnLabel === column);

                    return (
                      <td key={`${row}-${column}`} className="px-3 py-2">
                        <div className="font-semibold">{formatNumber(cell?.valuePerShare ?? 0)}</div>
                        <div className={toneForMargin(cell?.marginOfSafety ?? 0)}>
                          {formatPercent(cell?.marginOfSafety ?? 0)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function formatPercent(value: number) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "0.0%";
}

function colorForMargin(value: number) {
  if (value >= 0.25) {
    return "hsl(165 55% 34%)";
  }

  if (value >= 0) {
    return "hsl(var(--primary))";
  }

  return "hsl(4 65% 50%)";
}

function toneForMargin(value: number) {
  if (value >= 0.25) {
    return "mt-1 text-xs font-semibold text-emerald-700";
  }

  if (value >= 0) {
    return "mt-1 text-xs font-semibold text-primary";
  }

  return "mt-1 text-xs font-semibold text-red-700";
}
