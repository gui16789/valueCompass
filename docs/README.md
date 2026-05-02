# A 股价值投资 AI 导师文档

这个目录保存项目进入开发前的核心产品文档。

## 文档索引

- [PRD.md](./PRD.md)：产品需求文档，定义产品定位、核心模块、MVP 范围和验收标准。
- [PROJECT_PLAN.md](./PROJECT_PLAN.md)：项目计划，定义阶段、里程碑、页面清单和防偏离机制。
- [ROADMAP.md](./ROADMAP.md)：项目路线图，记录已确认选择、里程碑和近期执行顺序。
- [AI_ROLE_POLICY.md](./AI_ROLE_POLICY.md)：AI 角色与边界，定义导师、反方委员、考官、研究助理的行为规范。
- [DATA_MODEL.md](./DATA_MODEL.md)：数据模型草案，定义本地 MVP 和未来开放化所需的核心实体。
- [DECISION_LOG.md](./DECISION_LOG.md)：产品决策日志，记录关键决策和防偏离措施。
- [PAGE_ARCHITECTURE.md](./PAGE_ARCHITECTURE.md)：页面信息架构，定义导航、页面清单和核心用户流程。
- [MVP_TASKS.md](./MVP_TASKS.md)：MVP 开发任务拆分，定义开发顺序、验收标准和风险应对。
- [TECH_STACK.md](./TECH_STACK.md)：技术栈建议，定义 Next.js、SQLite、AI 适配层和本地安全方案。
- [CONTENT_SEED_PLAN.md](./CONTENT_SEED_PLAN.md)：第一批知识节点内容计划，定义时间线、学派、人物、书籍、概念和 A 股案例节点。
- [VALUATION_TEMPLATE_FIELDS.md](./VALUATION_TEMPLATE_FIELDS.md)：估值模板字段规格，定义四类 A 股模板和通用估值工具的最小字段。
- [UI_PROTOTYPE.md](./UI_PROTOTYPE.md)：前端低保真原型说明，定义工作台、AI 导师、观察池、估值和决策检查页面线框。
- [PROJECT_GOVERNANCE.md](./PROJECT_GOVERNANCE.md)：项目管理与开发规范，定义 Issue、分支、PR、验证、回退和防偏离规则。

## 当前产品边界

- 面向中国 A 股。
- 浏览器访问，本地优先。
- 用户自定义配置 AI 模型提供商。
- AI 作为耐心导师和投资委员会反方委员。
- 第一版估值工具覆盖金融、周期、消费、制造四类模板。
- 产品服务教育、训练、估值、投资原则、决策清单和复盘。
- 不做自动交易、自动荐股、短线信号和收益排行。

## 下一步

当前进入项目骨架阶段：

- 初始化 Next.js 本地项目。
- 建立基础导航和页面路由。
- 配置 SQLite 与 Drizzle。
- 先实现模型配置中心，再进入学习地图。
- 浏览器原型页可访问 `/prototype`。
- 基线提交之后，后续开发按照 Issue + Branch + PR 规范执行。
