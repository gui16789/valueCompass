# 技术栈建议

版本：v0.3

状态：推荐方案，待开发前确认

## 1. 技术目标

技术选型需要同时满足：

- 本地优先，用户可以在自己电脑浏览器访问。
- 支持用户自定义配置 AI 模型提供商。
- 支持结构化数据：知识库、观察池、估值、原则、日志和复盘。
- 未来可以从单用户本地版本演进到多用户 Web 版本。
- 第一版开发复杂度可控。

## 2. 推荐总体方案

推荐使用：

- 前端与服务端：Next.js App Router。
- 语言：TypeScript。
- UI：Tailwind CSS + Radix UI 或 shadcn/ui 组件风格。
- 图标：lucide-react。
- 数据库：SQLite。
- ORM：Drizzle ORM。
- 表单：React Hook Form + Zod。
- 图表：Recharts。
- 时间线与地图：自定义 React 组件，必要时引入轻量可视化库。
- AI 调用：自建模型适配层，优先支持 OpenAI API 兼容格式。
- 本地配置：`.env.local` + SQLite 配置表。
- API Key 加密：Node.js crypto，使用本地 `APP_SECRET`。

## 3. 为什么选择 Next.js

选择原因：

- 浏览器访问体验自然，符合用户偏好。
- 前后端可以在一个项目中完成，适合本地 MVP。
- App Router 支持服务端组件和服务端逻辑，便于减少前端暴露敏感信息。
- 后续部署到服务器时迁移成本低。
- 支持未来扩展用户系统、权限、审计和云端部署。

注意事项：

- 涉及 API Key、模型调用和数据库写入的逻辑放在服务端。
- 需要交互的页面组件再使用 Client Component。
- 大型图表、时间线和估值可视化组件按需加载。
- 避免把全部数据一次性传给客户端。

## 4. 前端架构

### 4.1 页面结构

建议采用 App Router 路由：

```text
app/
├── page.tsx
├── learn/
├── mentor/
├── training/
├── watchlist/
├── valuations/
├── system/
├── reviews/
└── settings/
```

### 4.2 组件分层

```text
components/
├── layout/
├── navigation/
├── learn/
├── ai/
├── watchlist/
├── valuation/
├── checklist/
├── review/
└── ui/
```

分层原则：

- `ui` 放通用基础组件。
- 业务组件按模块归属。
- 不在页面文件里堆复杂业务组件。
- 重型交互组件独立拆分并按需加载。

### 4.3 状态管理

MVP 优先使用：

- URL 参数管理筛选和当前视图。
- React Hook Form 管理表单。
- 服务端读取数据。
- 局部组件状态管理临时交互。

暂不引入大型全局状态库，除非后续出现真实跨页面状态需求。

## 5. 后端架构

Next.js 内部服务端承担：

- 数据库读写。
- 模型配置读取。
- API Key 解密。
- AI 请求转发。
- 估值计算。
- 知识节点读取。
- 决策日志和复盘保存。

建议目录：

```text
src/
├── db/
│   ├── schema.ts
│   ├── client.ts
│   └── migrations/
├── lib/
│   ├── ai/
│   ├── valuation/
│   ├── encryption/
│   └── validation/
├── data/
│   └── seeds/
└── server/
    ├── actions/
    └── queries/
```

## 6. 数据库

### 6.1 MVP 推荐 SQLite

选择原因：

- 本地开发和本地使用简单。
- 不需要用户安装独立数据库服务。
- 与单用户本地版本匹配。
- 后续可迁移 PostgreSQL。

### 6.2 ORM 推荐 Drizzle

选择原因：

- TypeScript 类型友好。
- 相对轻量。
- schema 与迁移清晰。
- 适合 SQLite 和未来 PostgreSQL。

## 7. AI 模型适配层

### 7.1 设计目标

模型适配层不绑定单一提供商。

必须支持：

- 自定义 API Base URL。
- 自定义 API Key。
- 自定义模型名称。
- OpenAI API 兼容格式。
- 按角色选择模型。
- 连接测试。
- 对话记录。

### 7.2 推荐结构

```text
src/lib/ai/
├── types.ts
├── provider-config.ts
├── openai-compatible.ts
├── prompts/
│   ├── mentor.ts
│   ├── opponent.ts
│   ├── examiner.ts
│   └── research-assistant.ts
└── guardrails.ts
```

### 7.3 边界

- API Key 只在服务端解密。
- 前端不接触明文 API Key。
- AI 输出保存时记录角色、模型和关联对象。
- 涉及买卖问题时经过角色提示词和输出边界约束。

## 8. 估值计算层

估值计算应独立于 UI，便于测试。

推荐结构：

```text
src/lib/valuation/
├── dcf.ts
├── reverse-dcf.ts
├── pe-scenario.ts
├── pb-roe.ts
├── dividend-discount.ts
├── owner-earnings.ts
├── financial.ts
├── cyclical.ts
├── consumer.ts
└── manufacturing.ts
```

原则：

- 计算函数保持纯函数。
- 输入输出使用 Zod schema 校验。
- 每个模板都支持悲观、中性、乐观三情景。
- AI 解释使用计算结果和输入假设，不重新计算关键公式。

## 9. 安全与隐私

MVP 本地版也要从一开始注意：

- API Key 加密存储。
- 不在日志输出 API Key。
- 用户数据默认保存在本地 SQLite。
- AI 请求前提示用户，联网模型会接收提交内容。
- 粘贴年报或公司资料时保留来源。

本地加密建议：

- 用户在 `.env.local` 配置 `APP_SECRET`。
- API Key 使用 `APP_SECRET` 加密后存入数据库。
- 如果缺少 `APP_SECRET`，模型配置页提示用户先配置。

## 10. 性能原则

参考 Vercel React/Next.js 最佳实践，MVP 阶段重点遵守：

- 服务端并行读取互不依赖的数据。
- 图表、复杂时间线和估值可视化按需加载。
- 避免把大量知识库正文一次性序列化到客户端。
- 长列表使用分页、筛选或虚拟化。
- 不在组件内部定义子组件。
- 表单状态局部化，避免全页重渲染。
- AI 对话、估值计算和资料提取使用明确的加载状态。

## 11. 本地运行形态

MVP 推荐：

- `npm run dev` 启动本地开发服务器。
- 默认访问 `http://localhost:3000`。
- SQLite 文件保存在项目目录下的本地数据目录。
- 未来提供导入导出和备份。

## 12. 未来开放化演进

当产品准备开放给其他人时：

- SQLite 迁移 PostgreSQL。
- 增加用户系统。
- 增加权限隔离。
- 增加 AI 输出审计。
- 增加用户模型 Key 隔离。
- 增加部署配置。
- 增加合规提示和使用条款。

## 13. 暂不推荐的方案

### 13.1 纯静态 HTML

原因：

- 难以安全处理 API Key。
- 难以管理结构化数据。
- 后续扩展成本高。

### 13.2 一开始做桌面应用

原因：

- 用户明确倾向浏览器访问。
- 桌面壳会增加安装和打包复杂度。
- 未来开放给其他人时迁移成本更高。

### 13.3 一开始接复杂行情和财报接口

原因：

- 会显著增加数据合规、稳定性和维护成本。
- 当前已确认手动录入和 AI 辅助填入可接受。
- MVP 的重点是学习和投资流程闭环。

## 14. 开发前待确认

需要最终确认：

- 是否采用 Next.js + TypeScript。
- 是否采用 SQLite + Drizzle。
- UI 组件采用 Radix UI 还是 shadcn/ui 风格。
- 是否第一版启用联网搜索。
- `APP_SECRET` 的本地配置方式。
