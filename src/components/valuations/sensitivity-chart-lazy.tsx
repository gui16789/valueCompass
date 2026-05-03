"use client";

import dynamic from "next/dynamic";

const SensitivityChart = dynamic(() => import("@/components/valuations/sensitivity-chart"), {
  ssr: false,
  loading: () => (
    <div className="mt-4 h-56 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
      正在加载估值图表...
    </div>
  )
});

export function SensitivityChartLazy({
  data,
  currentPrice,
  matrix
}: {
  data: Array<{ name: string; valuePerShare: number; marginOfSafety: number; impliedUpside: number }>;
  currentPrice: number;
  matrix?: {
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
}) {
  return <SensitivityChart data={data} currentPrice={currentPrice} matrix={matrix} />;
}
