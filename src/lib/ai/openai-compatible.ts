import type { ChatMessage, OpenAICompatibleConfig } from "@/lib/ai/types";
import { request as httpsRequest } from "node:https";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function callOpenAICompatibleChat({
  config,
  messages
}: {
  config: OpenAICompatibleConfig;
  messages: ChatMessage[];
}) {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, "");
  const url = `${baseUrl}/chat/completions`;
  const body = JSON.stringify({
    model: config.model,
    messages,
    temperature: config.temperature ?? 0.2
  });

  const response = config.allowInsecureTls
    ? await postJsonWithInsecureTls(url, config.apiKey, body)
    : await postJson(url, config.apiKey, body);

  const data = response.data;

  if (response.status < 200 || response.status >= 300) {
    throw new Error(data.error?.message || `模型连接失败：HTTP ${response.status}`);
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("模型响应为空，请检查模型名称或提供商配置。");
  }

  return content;
}

async function postJson(url: string, apiKey: string, body: string) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body,
      cache: "no-store"
    });

    return {
      status: response.status,
      data: (await response.json().catch(() => ({}))) as ChatCompletionResponse
    };
  } catch (error) {
    throw new Error(describeFetchFailure(error));
  }
}

async function postJsonWithInsecureTls(url: string, apiKey: string, body: string) {
  return new Promise<{ status: number; data: ChatCompletionResponse }>((resolve, reject) => {
    const target = new URL(url);
    const request = httpsRequest(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || 443,
        path: `${target.pathname}${target.search}`,
        method: "POST",
        rejectUnauthorized: false,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: `Bearer ${apiKey}`
        }
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data: ChatCompletionResponse = {};

          try {
            data = JSON.parse(text) as ChatCompletionResponse;
          } catch {
            data = { error: { message: text || "模型响应不是 JSON。" } };
          }

          resolve({
            status: response.statusCode ?? 0,
            data
          });
        });
      }
    );

    request.on("error", (error) => reject(new Error(describeFetchFailure(error))));
    request.write(body);
    request.end();
  });
}

function describeFetchFailure(error: unknown) {
  const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
  const code =
    cause && typeof cause === "object" && "code" in cause ? String(cause.code) : undefined;
  const message = cause instanceof Error ? cause.message : error instanceof Error ? error.message : "";

  if (code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY") {
    return "TLS 证书链校验失败：Node.js 不信任该模型服务的证书。若这是你信任的自建/代理服务，可在提供商配置中开启“跳过 TLS 证书校验”。";
  }

  if (code === "ENOTFOUND") {
    return "DNS 解析失败：服务端无法解析模型 Base URL 的域名，请检查网络、代理或域名是否正确。";
  }

  if (code === "ECONNREFUSED") {
    return "连接被拒绝：模型服务没有监听该地址或端口。";
  }

  if (code === "ETIMEDOUT") {
    return "连接超时：模型服务响应太慢或当前网络无法访问。";
  }

  return message || "模型连接失败。";
}

export async function testOpenAICompatibleConfig(config: OpenAICompatibleConfig) {
  return callOpenAICompatibleChat({
    config,
    messages: [
      {
        role: "system",
        content: "你只需要回答：连接成功"
      },
      {
        role: "user",
        content: "请确认模型连接是否正常。"
      }
    ]
  });
}
