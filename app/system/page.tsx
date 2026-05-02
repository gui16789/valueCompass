import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function SystemPage() {
  return (
    <PlaceholderPage
      title="投资系统"
      description="把投资原则、买入检查、卖出检查、不操作检查和决策日志串成流程。"
      items={["投资原则", "买入检查", "卖出检查", "不操作检查", "决策日志"]}
    />
  );
}
