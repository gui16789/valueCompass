# 数据模型草案

版本：v0.4

状态：已落地 MVP，后续按迁移文件和 P1/P2 需求持续维护

## 1. 设计目标

数据模型服务于本地优先的 A 股价值投资 AI 导师网站，并为未来多用户开放预留空间。

核心对象包括：

- 用户和模型配置。
- 学习知识库。
- 学习进度与测验。
- A 股观察池。
- 公司研究记录。
- 估值模板与估值记录。
- 投资原则。
- 决策检查清单。
- 决策日志。
- 复盘记录。

## 2. 基础约定

### 2.1 ID

所有主要实体使用字符串 ID，便于未来从本地数据库迁移到服务端数据库。

### 2.2 时间字段

建议每个核心表包含：

- created_at。
- updated_at。
- deleted_at，可选，用于软删除。

### 2.3 多用户预留

即使 MVP 是单用户，也建议核心业务表预留 user_id 字段，降低未来开放时的迁移成本。

## 3. 用户与模型配置

### 3.1 users

字段：

- id。
- name。
- email，可选。
- role。
- created_at。
- updated_at。

MVP 本地单用户可以内置一个默认用户。

### 3.2 model_providers

字段：

- id。
- user_id。
- name。
- api_base_url。
- api_key_encrypted。
- is_openai_compatible。
- default_temperature。
- max_context_tokens。
- status。
- created_at。
- updated_at。

说明：

- API Key 必须加密保存。
- 不在日志中输出 API Key。

### 3.3 model_configs

字段：

- id。
- user_id。
- provider_id。
- role：mentor、examiner、opponent、summarizer、research_assistant。
- model_name。
- temperature。
- max_tokens。
- enabled。
- created_at。
- updated_at。

## 4. 学习知识库

### 4.1 knowledge_nodes

字段：

- id。
- type：timeline、school、person、book、concept、case。
- title。
- subtitle。
- summary。
- body。
- period_start。
- period_end。
- tags。
- difficulty。
- source_refs。
- related_node_ids。
- order_index。
- created_at。
- updated_at。

示例类型：

- timeline：时间线节点。
- school：学派。
- person：人物。
- book：经典书籍。
- concept：概念。
- case：A 股案例。

### 4.2 learning_paths

字段：

- id。
- title。
- description。
- difficulty。
- node_ids。
- estimated_minutes。
- created_at。
- updated_at。

### 4.3 learning_progress

字段：

- id。
- user_id。
- node_id。
- status：not_started、learning、completed、review_needed。
- mastery_score。
- last_studied_at。
- notes。
- created_at。
- updated_at。

## 5. 测验与训练

### 5.1 quizzes

字段：

- id。
- node_id。
- title。
- quiz_type：concept、scenario、case、opposition、review。
- difficulty。
- prompt。
- reference_points。
- created_at。
- updated_at。

### 5.2 quiz_attempts

字段：

- id。
- user_id。
- quiz_id。
- answer。
- ai_feedback。
- mastery_score。
- weak_points。
- recommended_node_ids。
- created_at。
- updated_at。

## 6. A 股观察池

### 6.1 companies

字段：

- id。
- stock_code。
- stock_name。
- exchange：SSE、SZSE、BSE。
- industry。
- company_type：financial、cyclical、consumer、manufacturing、other。
- description。
- created_at。
- updated_at。

### 6.2 watchlist_items

字段：

- id。
- user_id。
- company_id。
- status：watching、researching、waiting_price、holding、excluded।
- in_circle_of_competence。
- business_model。
- moat_summary。
- financial_quality_summary。
- management_summary。
- valuation_status。
- key_risks。
- next_action。
- user_thesis。
- ai_summary。
- source_status：manual、ai_assisted、verified。
- created_at。
- updated_at。

### 6.3 source_refs

字段：

- id。
- user_id。
- entity_type：company、watchlist_item、valuation、decision、research_note。
- entity_id。
- title。
- url。
- source_type：annual_report、announcement、exchange_disclosure、company_site、news、research_report、manual_note。
- published_at。
- retrieved_at。
- reliability。
- notes。
- created_at。
- updated_at。

## 7. 公司研究记录

### 7.1 research_notes

字段：

- id。
- user_id。
- company_id。
- title。
- note_type：business、financials、management、industry、risk、valuation_input、meeting_note。
- content。
- ai_generated。
- source_ref_ids。
- created_at。
- updated_at。

### 7.2 financial_snapshots

字段：

- id。
- user_id。
- company_id。
- fiscal_period。
- revenue。
- net_profit。
- operating_cash_flow。
- free_cash_flow。
- total_assets。
- total_liabilities。
- equity。
- roe。
- gross_margin。
- net_margin。
- debt_ratio。
- dividend_payout_ratio。
- notes。
- source_ref_ids。
- created_at。
- updated_at。

说明：

- MVP 可以先支持用户手动录入关键字段。
- 后续可扩展更多行业字段。

## 8. 估值系统

### 8.1 valuation_templates

字段：

- id。
- name。
- company_type：financial、cyclical、consumer、manufacturing、general。
- description。
- input_schema。
- output_schema。
- created_at。
- updated_at。

### 8.2 valuations

字段：

- id。
- user_id。
- company_id。
- template_id。
- title。
- valuation_date。
- current_price。
- shares_outstanding。
- scenario_base。
- scenario_bear。
- scenario_bull。
- estimated_value_base。
- estimated_value_bear。
- estimated_value_bull。
- margin_of_safety。
- implied_return。
- ai_explanation。
- opponent_questions。
- source_ref_ids。
- created_at。
- updated_at。

场景字段建议使用 JSON：

- input_assumptions。
- output_values。
- sensitivity。
- notes。

### 8.3 valuation_inputs

字段：

- id。
- valuation_id。
- key。
- label。
- value。
- unit。
- scenario：bear、base、bull。
- explanation。
- created_at。
- updated_at。

## 9. 投资原则

### 9.1 investment_principles

字段：

- id。
- user_id。
- title。
- circle_of_competence。
- excluded_industries。
- minimum_financial_quality。
- minimum_margin_of_safety。
- max_single_position。
- max_industry_position。
- buy_rules。
- sell_rules。
- do_nothing_rules。
- risk_rules。
- version。
- active。
- created_at。
- updated_at。

### 9.2 principle_revisions

字段：

- id。
- user_id。
- principle_id。
- version。
- change_summary。
- reason。
- content_snapshot。
- created_at。

## 10. 检查清单

### 10.1 checklists

字段：

- id。
- user_id。
- type：buy、sell、do_nothing。
- title。
- description。
- active。
- created_at。
- updated_at。

### 10.2 checklist_items

字段：

- id。
- checklist_id。
- text。
- category。
- required。
- order_index。
- created_at。
- updated_at。

### 10.3 checklist_runs

字段：

- id。
- user_id。
- checklist_id。
- company_id。
- decision_id，可选。
- completed_at。
- summary。
- ai_review。
- created_at。
- updated_at。

### 10.4 checklist_run_items

字段：

- id。
- checklist_run_id。
- checklist_item_id。
- status：pass、fail、unknown、not_applicable。
- note。
- created_at。
- updated_at。

## 11. 决策日志

### 11.1 decisions

字段：

- id。
- user_id。
- company_id。
- decision_type：buy、sell、hold、do_nothing、add_to_watchlist、exclude。
- decision_date。
- price。
- position_size，可选。
- linked_valuation_id。
- linked_principle_id。
- thesis。
- key_assumptions。
- risks。
- opponent_summary。
- checklist_run_id。
- final_user_judgment。
- ai_disclaimer_acknowledged。
- created_at。
- updated_at。

说明：

- final_user_judgment 必须由用户确认。
- AI 不应自动填入最终决策结论。

## 12. 复盘记录

### 12.1 reviews

字段：

- id。
- user_id。
- decision_id。
- company_id。
- review_type：post_decision、quarterly、annual、mistake。
- review_date。
- what_happened。
- assumptions_validated。
- assumptions_failed。
- lessons。
- principle_changes_needed。
- ai_summary。
- created_at。
- updated_at。

## 13. AI 会话与输出记录

### 13.1 ai_sessions

字段：

- id。
- user_id。
- role：mentor、examiner、opponent、research_assistant。
- related_entity_type。
- related_entity_id。
- title。
- created_at。
- updated_at。

### 13.2 ai_messages

字段：

- id。
- session_id。
- sender：user、assistant、system。
- content。
- model_provider_id。
- model_name。
- token_usage。
- created_at。

说明：

- 不记录 API Key。
- 对外开放前需要支持敏感信息脱敏。

## 14. MVP 数据优先级

MVP 第一批必须实现：

- model_providers。
- model_configs。
- knowledge_nodes。
- learning_progress。
- quizzes。
- quiz_attempts。
- companies。
- watchlist_items。
- source_refs。
- valuations。
- investment_principles。
- checklists。
- checklist_runs。
- decisions。
- reviews。
- ai_sessions。
- ai_messages。

可以延后：

- principle_revisions。
- financial_snapshots 的完整行业字段。
- valuation_templates 的复杂可视化配置。
- 多用户权限系统。
