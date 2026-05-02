# 项目管理与开发规范

版本：v0.1

状态：生效

适用范围：长投罗盘 / Value Compass

## 1. 目标

本文档定义项目后续开发、Issue、分支、PR、验证、回退和发布规范，目标是：

- 所有变更可追踪。
- 所有功能有明确需求来源。
- 所有代码改动可审查、可回退。
- 避免直接在主分支上无序修改导致项目崩盘。
- 保持产品不偏离“价值投资学习、训练、估值、投资流程和复盘系统”的定位。

## 2. 仓库与分支

远端仓库：

- `https://github.com/gui16789/valueCompass.git`

主分支：

- `main`

分支规则：

- `main` 只保留稳定可运行代码。
- 不直接在 `main` 上开发功能。
- 每个功能、修复或文档变更都应从 Issue 开始。
- 每个 Issue 对应一个工作分支。
- 每个工作分支通过 PR 合并回 `main`。

分支命名：

```text
feature/issue-编号-简短描述
fix/issue-编号-简短描述
docs/issue-编号-简短描述
chore/issue-编号-简短描述
```

示例：

```text
feature/issue-3-model-provider-edit
fix/issue-5-test-connection-state
docs/issue-7-governance
```

## 3. Issue 规范

所有正式开发任务都应创建 GitHub Issue。

Issue 类型：

- `feature`：新功能。
- `bug`：缺陷修复。
- `docs`：文档。
- `refactor`：重构。
- `chore`：工程维护。
- `design`：交互或视觉设计。
- `research`：调研。

Issue 内容必须包含：

- 背景。
- 用户问题。
- 目标。
- 范围。
- 非目标。
- 验收标准。
- 关联文档。
- 风险与回退方式。

Issue 模板：

```text
## 背景

## 用户问题

## 目标

## 范围

## 非目标

## 验收标准

## 关联文档

## 风险与回退
```

## 4. PR 规范

每个 PR 应只解决一个明确问题，避免把多个不相关改动塞进同一个 PR。

PR 必须包含：

- 关联 Issue。
- 本次改动摘要。
- 主要文件变更。
- 验证方式。
- 截图或页面说明，适用于前端改动。
- 数据库迁移说明，适用于 schema 改动。
- 风险与回退方案。

PR 模板：

```text
## 关联 Issue

Closes #

## 改动摘要

## 主要文件

## 验证

- [ ] npm run typecheck
- [ ] npm run build，涉及生产构建时执行
- [ ] 手动验证关键页面

## 截图 / 说明

## 数据库迁移

## 风险

## 回退方案
```

## 5. 提交规范

提交信息使用简洁的 Conventional Commits 风格：

```text
feat: add model provider editing
fix: prevent redirect being captured as test failure
docs: add project governance
chore: initialize next app
refactor: extract provider test service
```

常用类型：

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`
- `style`

## 6. 验证规范

每次代码 PR 至少运行：

```bash
npm run typecheck
```

涉及页面、路由、构建配置、Next.js 行为时运行：

```bash
npm run build
```

注意：

- 当前开发阶段发现，`next dev` 运行期间执行 `next build` 可能导致 `.next` manifest 临时错乱。
- 如果执行过 `npm run build`，建议重启 `npm run dev`。
- `.next` 是生成目录，不提交。

## 7. 数据库迁移规范

涉及 `src/db/schema.ts` 的改动必须：

1. 执行迁移生成。

```bash
npm run db:generate
```

2. 执行本地迁移。

```bash
npm run db:migrate
```

3. 在 PR 中说明：

- 新增/修改/删除了哪些表和字段。
- 是否影响已有本地数据。
- 是否需要数据修复脚本。

数据库规则：

- `data/local.db` 不提交。
- migration SQL 文件需要提交。
- 不在 migration 中写入用户 API Key 或个人数据。

## 8. 密钥与隐私

禁止提交：

- `.env`
- `.env.local`
- API Key
- 真实用户数据
- 本地数据库文件
- 浏览器缓存
- 日志中的敏感内容

当前本地密钥：

- `APP_SECRET` 只存在 `.env.local`。
- 用于加密模型 API Key。
- `.env.local` 已被 `.gitignore` 忽略。

如果怀疑密钥泄露：

1. 立即从远端历史检查是否提交。
2. 撤销对应 API Key。
3. 替换 `.env.local` 中的 `APP_SECRET`。
4. 重新保存模型配置。

## 9. 回退规范

优先回退方式：

1. 回退 PR。
2. 新建 `fix` 分支修复。
3. 必要时使用 `git revert <commit>`。

禁止默认使用：

```bash
git reset --hard
git checkout -- .
```

除非用户明确要求，否则不执行破坏性回退。

回退前必须确认：

- 要回退的 commit 或 PR。
- 是否包含数据库迁移。
- 是否影响本地数据。
- 是否需要备份 `data/local.db`。

## 10. 产品防偏离规则

任何功能进入开发前，都要检查是否符合产品北极星：

帮助用户形成一套可解释、可复盘、可长期执行的 A 股价值投资系统。

不进入 MVP：

- 自动荐股。
- 今日买入列表。
- 买卖信号。
- 自动交易。
- 收益排行。
- 社区跟单。

涉及具体个股时，AI 输出必须回到：

- 用户原则。
- 数据来源。
- 估值假设。
- 风险清单。
- 用户最终判断。

## 11. 开发节奏

推荐流程：

1. 创建 Issue。
2. 从 `main` 创建工作分支。
3. 实现小而完整的改动。
4. 本地验证。
5. 提交 commit。
6. 推送分支。
7. 创建 PR。
8. PR 通过后合并到 `main`。
9. 删除远端工作分支。

## 12. 当前阶段例外

当前项目处于初始化阶段，允许将现有本地文档和项目骨架作为初始基线直接提交到 `main`。

基线提交之后，所有后续开发应严格按 Issue + Branch + PR 流程执行。

