"use client";

import { useState } from "react";
import { Pencil, PlugZap, Trash2, X } from "lucide-react";
import { PendingButton } from "@/components/ui/pending-button";
import { aiRoles } from "@/lib/model-config/constants";
import {
  deleteModelProvider,
  toggleProviderTlsMode,
  updateModelProvider
} from "../../../app/settings/actions";

type ProviderCardProps = {
  provider: {
    id: string;
    name: string;
    apiBaseUrl: string;
    defaultModelName: string;
    defaultTemperature: number;
    maxContextTokens: number;
    allowInsecureTls: boolean;
    lastTestStatus: string;
    lastTestMessage: string;
    configs: Array<{
      role: string;
      modelName: string;
      temperature: number;
    }>;
  };
};

export function ProviderCard({ provider }: ProviderCardProps) {
  const [testState, setTestState] = useState({
    status: provider.lastTestStatus,
    message: provider.lastTestMessage
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function testConnection() {
    setIsTesting(true);
    setTestState({
      status: "testing",
      message: "正在连接模型服务..."
    });

    try {
      const response = await fetch(`/api/model-providers/${provider.id}/test`, {
        method: "POST"
      });
      const data = (await response.json()) as {
        status?: string;
        message?: string;
      };

      setTestState({
        status: data.status ?? (response.ok ? "success" : "failed"),
        message: data.message ?? (response.ok ? "连接测试成功。" : "连接测试失败。")
      });
    } catch (error) {
      setTestState({
        status: "failed",
        message: error instanceof Error ? error.message : "连接测试失败。"
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold">{provider.name}</h3>
            <StatusPill status={testState.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{provider.apiBaseUrl}</p>
          <p className="mt-1 text-sm text-muted-foreground">默认模型：{provider.defaultModelName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            TLS：{provider.allowInsecureTls ? "已跳过证书校验" : "标准证书校验"}
          </p>
          {testState.message ? (
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {testState.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={toggleProviderTlsMode}>
            <input type="hidden" name="providerId" value={provider.id} />
            <input
              type="hidden"
              name="allowInsecureTls"
              value={provider.allowInsecureTls ? "false" : "true"}
            />
            <PendingButton
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
              pendingChildren={provider.allowInsecureTls ? "正在关闭..." : "正在开启..."}
            >
              {provider.allowInsecureTls ? "关闭 TLS 跳过" : "跳过 TLS 校验"}
            </PendingButton>
          </form>
          <button
            type="button"
            onClick={testConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
          >
            <PlugZap className="h-4 w-4" aria-hidden />
            {isTesting ? "测试中..." : "测试连接"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            {isEditing ? <X className="h-4 w-4" aria-hidden /> : <Pencil className="h-4 w-4" aria-hidden />}
            {isEditing ? "收起编辑" : "编辑配置"}
          </button>
          <form action={deleteModelProvider}>
            <input type="hidden" name="providerId" value={provider.id} />
            <PendingButton
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
              pendingChildren={
                <>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  删除中...
                </>
              }
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              删除
            </PendingButton>
          </form>
        </div>
      </div>
      {isEditing ? <ProviderEditForm provider={provider} /> : null}
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {aiRoles.map((role) => {
          const config = provider.configs.find((item) => item.role === role.value);

          return (
            <div key={role.value} className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold">{role.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {config?.modelName ?? provider.defaultModelName}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                温度：{((config?.temperature ?? provider.defaultTemperature) / 100).toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProviderEditForm({ provider }: ProviderCardProps) {
  return (
    <form action={updateModelProvider} className="mt-5 rounded-lg border border-border bg-card p-4">
      <input type="hidden" name="providerId" value={provider.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <EditField label="提供商名称" name="name" defaultValue={provider.name} />
        <EditField label="API Base URL" name="apiBaseUrl" defaultValue={provider.apiBaseUrl} type="url" />
        <EditField label="默认模型名称" name="defaultModelName" defaultValue={provider.defaultModelName} />
        <EditField
          label="API Key"
          name="apiKey"
          defaultValue=""
          type="password"
          placeholder="留空则继续使用当前已保存 Key"
        />
        <EditField
          label="最大上下文 Tokens"
          name="maxContextTokens"
          defaultValue={String(provider.maxContextTokens)}
          type="number"
        />
        <EditField
          label="默认温度"
          name="temperature"
          defaultValue={String(provider.defaultTemperature / 100)}
          type="number"
          step="0.1"
        />
      </div>
      <label className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-background p-3">
        <input
          name="allowInsecureTls"
          type="checkbox"
          className="mt-1"
          defaultChecked={provider.allowInsecureTls}
        />
        <span>
          <span className="block text-sm font-semibold">跳过 TLS 证书校验</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            仅用于你信任的自建或代理模型服务。公开云模型不建议开启。
          </span>
        </span>
      </label>
      <div className="mt-5">
        <div className="text-sm font-semibold">角色模型配置</div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          可以为不同 AI 角色设置不同模型或温度。留用默认模型时保持与提供商默认模型一致。
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {aiRoles.map((role) => {
            const config = provider.configs.find((item) => item.role === role.value);

            return (
              <div key={role.value} className="rounded-lg border border-border bg-background p-3">
                <div className="text-sm font-semibold">{role.label}</div>
                <div className="mt-3 grid gap-3">
                  <EditField
                    label="模型名称"
                    name={`roleModelName.${role.value}`}
                    defaultValue={config?.modelName ?? provider.defaultModelName}
                  />
                  <EditField
                    label="温度"
                    name={`roleTemperature.${role.value}`}
                    defaultValue={String((config?.temperature ?? provider.defaultTemperature) / 100)}
                    type="number"
                    step="0.1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <PendingButton
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          pendingChildren="保存中..."
        >
          保存修改
        </PendingButton>
      </div>
    </form>
  );
}

function EditField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  step
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const text =
    status === "success"
      ? "连接成功"
      : status === "failed"
        ? "连接失败"
        : status === "testing"
          ? "测试中"
          : "未测试";

  return (
    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
      {text}
    </span>
  );
}
