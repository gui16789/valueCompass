import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function WatchlistPage() {
  return (
    <PlaceholderPage
      title="观察池"
      description="用于维护 A 股公司，从观察、深研、等待价格、持有到排除。"
      items={["公司列表", "研究摘要", "资料来源", "AI 辅助提取"]}
    />
  );
}
