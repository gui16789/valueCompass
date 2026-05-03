# 估值模板字段规格

版本：v0.4

状态：已落地 MVP，并已补充 AI 估值草稿与敏感性图表增强

## 1. 目标

本文档定义 MVP 第一版估值工具的最小输入字段、输出字段和 AI 解释重点。估值工具追求专业完整，但第一版需要控制输入复杂度，让用户可以逐步展开。

## 2. 通用原则

所有估值模板都应支持：

- 公司。
- 估值日期。
- 当前价格。
- 总股本。
- 悲观、中性、乐观三情景。
- 关键假设。
- 估值结果区间。
- 安全边际。
- AI 通俗解释。
- AI 反方质疑。

估值结果必须表达为区间和假设，不表达为确定价格。

## 3. 通用字段

### 3.1 基础字段

- company_id。
- valuation_date。
- current_price。
- shares_outstanding。
- template_type。
- valuation_currency，MVP 默认 CNY。
- user_notes。
- source_ref_ids。

### 3.2 三情景字段

每个场景包含：

- scenario_name：bear、base、bull。
- revenue_growth。
- profit_growth。
- margin_assumption。
- valuation_multiple。
- discount_rate。
- terminal_growth_rate。
- expected_dividend_yield。
- assumption_notes。

不同模板可以只使用其中部分字段。

### 3.3 输出字段

- estimated_equity_value。
- estimated_value_per_share。
- margin_of_safety。
- implied_upside_downside。
- expected_return。
- key_sensitivity。
- risk_flags。
- ai_explanation。
- opponent_questions。

## 4. 金融股模板

适用：

- 银行。
- 保险。
- 券商。

### 4.1 最小输入字段

基础：

- current_price。
- shares_outstanding。
- net_assets_per_share。
- latest_roe。
- dividend_payout_ratio。

银行补充：

- non_performing_loan_ratio。
- provision_coverage_ratio。
- net_interest_margin。
- capital_adequacy_ratio。

保险补充：

- embedded_value。
- new_business_value_growth。
- investment_yield。

券商补充：

- net_capital。
- brokerage_income_share。
- proprietary_trading_income_share。

### 4.2 估值逻辑

MVP 优先使用：

- PB-ROE 估值。
- 股息回报测算。
- 三情景 PB 区间。

输出：

- 合理 PB 区间。
- 每股估值区间。
- 股息回报。
- ROE 与 PB 匹配提醒。
- 资产质量风险提示。

### 4.3 AI 解释重点

AI 应解释：

- 为什么金融股常用 PB。
- ROE 与 PB 的关系。
- 不良率和拨备覆盖率如何影响安全性。
- 为什么高分红不一定等于低风险。

### 4.4 反方质疑重点

AI 应追问：

- ROE 是否可持续。
- 资产质量是否被低估。
- 当前利润是否受周期或政策影响。
- 估值是否忽略了尾部风险。

## 5. 周期股模板

适用：

- 煤炭。
- 钢铁。
- 有色。
- 化工。
- 航运。

### 5.1 最小输入字段

基础：

- current_price。
- shares_outstanding。
- latest_revenue。
- latest_net_profit。
- latest_free_cash_flow。
- net_debt。
- debt_ratio。

周期字段：

- normalized_net_profit。
- historical_peak_profit。
- historical_trough_profit。
- commodity_price_assumption。
- capacity_cycle_position。
- cash_cost_position。

### 5.2 估值逻辑

MVP 优先使用：

- 周期中枢利润。
- 归一化 PE。
- 资产负债安全性检查。
- 商品价格敏感性。

输出：

- 周期中枢市值。
- 每股估值区间。
- 当前利润相对周期位置。
- 价格敏感性。
- 负债风险提示。

### 5.3 AI 解释重点

AI 应解释：

- 为什么周期股不能只看当期 PE。
- 周期中枢利润是什么意思。
- 顶部利润会让估值看起来虚假便宜。
- 负债在周期下行时为什么危险。

### 5.4 反方质疑重点

AI 应追问：

- 当前是否处于景气顶部。
- 中枢利润估计是否过于乐观。
- 资本开支是否会破坏现金流。
- 供给周期是否正在反转。

## 6. 消费股模板

适用：

- 白酒。
- 食品饮料。
- 家电。
- 品牌消费。
- 稳定服务消费。

### 6.1 最小输入字段

基础：

- current_price。
- shares_outstanding。
- latest_revenue。
- latest_net_profit。
- latest_free_cash_flow。
- latest_roe。

质量字段：

- revenue_growth_3y。
- net_profit_growth_3y。
- gross_margin。
- net_margin。
- free_cash_flow_conversion。
- dividend_payout_ratio。

商业字段：

- pricing_power_score。
- channel_inventory_status。
- brand_strength_note。
- market_share_note。

### 6.2 估值逻辑

MVP 优先使用：

- PE 情景估值。
- 自由现金流质量检查。
- 股息回报辅助。

输出：

- 合理 PE 区间。
- 每股估值区间。
- 增长与估值匹配度。
- 现金流质量提示。
- 品牌和渠道风险提示。

### 6.3 AI 解释重点

AI 应解释：

- 为什么消费股常用 PE。
- 增长、ROE、现金流和估值倍数的关系。
- 渠道库存为什么重要。
- 提价能力如何影响长期价值。

### 6.4 反方质疑重点

AI 应追问：

- 高毛利率是否可持续。
- 渠道库存是否透支未来需求。
- 增长是否已经被估值充分反映。
- 品牌力是否被高估。

## 7. 制造业模板

适用：

- 先进制造。
- 机械。
- 电力设备。
- 汽车零部件。
- 电子制造。

### 7.1 最小输入字段

基础：

- current_price。
- shares_outstanding。
- latest_revenue。
- latest_net_profit。
- latest_free_cash_flow。
- latest_roe。

经营字段：

- revenue_growth_3y。
- gross_margin_trend。
- net_margin。
- r_and_d_ratio。
- capex_ratio。
- inventory_growth。
- accounts_receivable_growth。
- operating_cash_flow_to_net_profit。

竞争字段：

- capacity_utilization_note。
- competitive_position_note。
- customer_concentration_note。

### 7.2 估值逻辑

MVP 优先使用：

- DCF。
- PE 情景估值。
- 现金流质量检查。
- 资本开支压力检查。

输出：

- DCF 估值区间。
- PE 情景估值区间。
- 现金流质量提示。
- 存货和应收风险。
- 竞争格局风险。

### 7.3 AI 解释重点

AI 应解释：

- 为什么制造业不能只看收入增长。
- 研发、资本开支和自由现金流之间的关系。
- 存货和应收账款为什么会影响利润质量。
- DCF 对长期假设为什么敏感。

### 7.4 反方质疑重点

AI 应追问：

- 增长是否依赖高资本开支。
- 毛利率是否可能被竞争压低。
- 应收账款和存货是否异常。
- 客户集中度是否带来风险。

## 8. 通用 DCF 字段

输入：

- base_free_cash_flow。
- forecast_years。
- fcf_growth_year_1_to_5。
- fcf_growth_year_6_to_10，可选。
- discount_rate。
- terminal_growth_rate。
- net_cash_or_debt。
- shares_outstanding。

输出：

- present_value_of_forecast_fcf。
- terminal_value。
- present_value_of_terminal_value。
- equity_value。
- value_per_share。
- margin_of_safety。

AI 解释重点：

- 折现率。
- 永续增长率。
- 自由现金流起点。
- 终值占比。
- 对长期假设的敏感性。

## 9. 反向 DCF 字段

输入：

- current_price。
- shares_outstanding。
- base_free_cash_flow。
- discount_rate。
- terminal_growth_rate。
- forecast_years。

输出：

- implied_fcf_growth。
- implied_terminal_value_ratio。
- implied_expectation_summary。

AI 解释重点：

- 当前价格隐含了怎样的增长。
- 这个增长假设是否容易实现。
- 如果增长低于隐含值，估值会怎样变化。

## 10. 安全边际字段

输入：

- current_price。
- estimated_value_per_share。

输出：

- margin_of_safety。

公式：

```text
margin_of_safety = (estimated_value_per_share - current_price) / estimated_value_per_share
```

说明：

- 安全边际不是保证收益。
- 安全边际用于对抗估值错误、商业变化和市场不确定性。

## 11. MVP 表单分层

为了兼顾专业和易用，估值表单建议分三层：

- 必填字段：完成估值所需最小输入。
- 重要字段：提升估值质量。
- 高级字段：敏感性和行业细节。

默认展示必填和重要字段，高级字段折叠。

## 12. 验收标准

估值模板完成后应满足：

- 每类模板可以独立创建估值记录。
- 每类模板支持三情景输入。
- 每类模板能输出每股估值区间。
- 每类模板能计算安全边际。
- AI 能解释关键参数。
- AI 能给出反方质疑。
- 页面不输出直接买入或卖出指令。
