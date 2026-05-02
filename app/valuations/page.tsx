import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function ValuationsPage() {
  return (
    <PlaceholderPage
      title="估值工具"
      description="第一版覆盖金融、周期、消费、制造四类模板，并提供通用 DCF 和安全边际计算。"
      items={["金融股模板", "周期股模板", "消费股模板", "制造业模板", "反向 DCF", "安全边际"]}
    />
  );
}
