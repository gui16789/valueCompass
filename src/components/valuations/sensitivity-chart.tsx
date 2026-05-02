"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type SensitivityPoint = {
  name: string;
  valuePerShare: number;
};

export default function SensitivityChart({
  data,
  currentPrice
}: {
  data: SensitivityPoint[];
  currentPrice: number;
}) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-card p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-semibold text-primary">三情景估值图</div>
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
            <Bar dataKey="valuePerShare" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
