import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function MentorPage() {
  return (
    <PlaceholderPage
      title="AI 导师"
      description="下一阶段会接入用户自配的 OpenAI API 兼容模型，并支持导师、反方委员、考官和研究助理四种角色。"
      items={["导师模式", "反方委员模式", "考官模式", "研究助理模式"]}
    />
  );
}
