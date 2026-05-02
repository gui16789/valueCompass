import { AlertCircle, Bot, CheckCircle2, Download, KeyRound } from "lucide-react";
import {
  saveModelProvider,
} from "./actions";
import { SectionHeader } from "@/components/ui/section-header";
import { PendingButton } from "@/components/ui/pending-button";
import { ProviderCard } from "@/components/settings/provider-card";
import { aiRoles } from "@/lib/model-config/constants";
import { getModelProvidersWithConfigs } from "@/lib/model-config/queries";

type SettingsPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const paramsPromise: Promise<{ status?: string; message?: string }> = searchParams ?? Promise.resolve({});
  const [params, providers] = await Promise.all([paramsPromise, getModelProvidersWithConfigs()]);
  const hasAppSecret = Boolean(process.env.APP_SECRET && process.env.APP_SECRET.length >= 24);

  return (
    <main className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            title="模型配置中心"
            description="第一阶段支持 OpenAI API 兼容格式。API Key 只在服务端加密保存，不会暴露到浏览器页面。"
          />
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
            <div className="font-semibold">本地安全状态</div>
            <div className="mt-1 text-muted-foreground">
              {hasAppSecret ? "APP_SECRET 已配置，可以加密保存 API Key。" : "缺少 APP_SECRET，暂不能保存 API Key。"}
            </div>
          </div>
        </div>
      </section>

      {params.message ? (
        <StatusBanner status={params.status === "success" ? "success" : "error"} message={params.message} />
      ) : null}

      {!hasAppSecret ? (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div>
              <h2 className="font-semibold">先配置本地加密密钥</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                在项目根目录创建 `.env.local`，写入 `APP_SECRET=&quot;至少 24 位的本地随机字符串&quot;`，然后重启开发服务器。这个密钥只用于本地加密模型 API Key。
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="新增模型提供商" description="可配置 OpenAI、DeepSeek、通义千问兼容接口、本地兼容服务等。" />
          <form action={saveModelProvider} className="mt-6 space-y-5">
            <Field label="提供商名称" name="name" placeholder="例如：DeepSeek / OpenAI / 本地模型" />
            <Field label="API Base URL" name="apiBaseUrl" placeholder="例如：https://api.openai.com/v1" type="url" />
            <Field label="API Key" name="apiKey" placeholder="只会在服务端加密保存" type="password" />
            <Field label="默认模型名称" name="defaultModelName" placeholder="例如：gpt-4.1-mini / deepseek-chat" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="最大上下文 Tokens" name="maxContextTokens" placeholder="8000" type="number" defaultValue="8000" />
              <Field label="默认温度" name="temperature" placeholder="0.2" type="number" defaultValue="0.2" step="0.1" />
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input name="allowInsecureTls" type="checkbox" className="mt-1" />
              <span>
                <span className="block text-sm font-semibold">跳过 TLS 证书校验</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  仅用于你信任的自建或代理模型服务。公开云模型不建议开启。
                </span>
              </span>
            </label>
            <PendingButton
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              disabled={!hasAppSecret}
              pendingChildren={
                <>
                  <KeyRound className="h-4 w-4" aria-hidden />
                  保存中...
                </>
              }
            >
              <KeyRound className="h-4 w-4" aria-hidden />
              保存配置
            </PendingButton>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <SectionHeader title="AI 角色分配" description="保存提供商后，系统会先把四个角色绑定到默认模型；后续可单独调整。" />
          <div className="mt-5 grid gap-3">
            {aiRoles.map((role) => (
              <div key={role.value} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" aria-hidden />
                  <span className="font-semibold">{role.label}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <SectionHeader title="已保存提供商" description="连接测试会向配置的模型发送一条最小测试消息。" />
        <div className="mt-5 space-y-4">
          {providers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
              还没有模型提供商。先新增一个 OpenAI API 兼容配置，后续 AI 导师、反方委员和考官都会从这里读取模型。
            </div>
          ) : (
            providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            title="本地数据备份"
            description="导出观察池、估值、原则、检查、决策、复盘和 AI 对话记录。导出文件不包含模型 API Key。"
          />
          <a
            href="/api/export"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            <Download className="h-4 w-4" aria-hidden />
            导出 JSON
          </a>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          导出文件可能包含你的研究记录和决策复盘，请保存在你信任的位置。导入恢复功能放在后续版本。
        </p>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue,
  step
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={step}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}

function StatusBanner({ status, message }: { status: "success" | "error"; message: string }) {
  const Icon = status === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
        <p className="text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}
