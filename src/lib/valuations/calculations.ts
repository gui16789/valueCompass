import type { ScenarioName, ValuationTemplateType } from "@/lib/valuations/constants";

export type ValuationScenarioInput = {
  name: ScenarioName;
  basisAmount: number;
  growthRate: number;
  valuationMultiple: number;
  discountRate: number;
  terminalGrowthRate: number;
  dividendYield: number;
  notes: string;
};

export type ScenarioResult = {
  name: ScenarioName;
  valuePerShare: number;
  equityValue: number;
  marginOfSafety: number;
  impliedUpside: number;
};

export type ValuationResult = {
  lowValuePerShare: number;
  baseValuePerShare: number;
  highValuePerShare: number;
  baseMarginOfSafety: number;
  baseImpliedUpside: number;
  scenarioResults: ScenarioResult[];
  riskFlags: string[];
};

export function calculateValuation({
  templateType,
  currentPrice,
  sharesOutstanding,
  scenarios
}: {
  templateType: ValuationTemplateType;
  currentPrice: number;
  sharesOutstanding: number;
  scenarios: ValuationScenarioInput[];
}): ValuationResult {
  const scenarioResults = scenarios.map((scenario) =>
    calculateScenario({ templateType, currentPrice, sharesOutstanding, scenario })
  );
  const sortedValues = scenarioResults.map((scenario) => scenario.valuePerShare).sort((a, b) => a - b);
  const base = scenarioResults.find((scenario) => scenario.name === "base") ?? scenarioResults[1] ?? scenarioResults[0];

  return {
    lowValuePerShare: sortedValues[0] ?? 0,
    baseValuePerShare: base?.valuePerShare ?? 0,
    highValuePerShare: sortedValues[sortedValues.length - 1] ?? 0,
    baseMarginOfSafety: base?.marginOfSafety ?? 0,
    baseImpliedUpside: base?.impliedUpside ?? 0,
    scenarioResults,
    riskFlags: buildRiskFlags({ templateType, currentPrice, sharesOutstanding, scenarios, baseValue: base?.valuePerShare ?? 0 })
  };
}

function calculateScenario({
  templateType,
  currentPrice,
  sharesOutstanding,
  scenario
}: {
  templateType: ValuationTemplateType;
  currentPrice: number;
  sharesOutstanding: number;
  scenario: ValuationScenarioInput;
}): ScenarioResult {
  let valuePerShare = 0;

  if (templateType === "financial") {
    valuePerShare = scenario.basisAmount * scenario.valuationMultiple;
  }

  if (templateType === "cyclical") {
    valuePerShare = sharesOutstanding > 0 ? (scenario.basisAmount * scenario.valuationMultiple) / sharesOutstanding : 0;
  }

  if (templateType === "consumer") {
    const normalizedProfit = scenario.basisAmount * Math.pow(1 + scenario.growthRate, 3);
    valuePerShare = sharesOutstanding > 0 ? (normalizedProfit * scenario.valuationMultiple) / sharesOutstanding : 0;
  }

  if (templateType === "manufacturing") {
    const dcfValue = calculateDcfPerShare({ scenario, sharesOutstanding });
    const peCrossCheck =
      sharesOutstanding > 0 && scenario.valuationMultiple > 0
        ? (scenario.basisAmount * Math.pow(1 + scenario.growthRate, 3) * scenario.valuationMultiple) / sharesOutstanding
        : 0;
    valuePerShare = peCrossCheck > 0 ? (dcfValue + peCrossCheck) / 2 : dcfValue;
  }

  const equityValue = valuePerShare * sharesOutstanding;
  const marginOfSafety = valuePerShare > 0 ? (valuePerShare - currentPrice) / valuePerShare : 0;
  const impliedUpside = currentPrice > 0 ? (valuePerShare - currentPrice) / currentPrice : 0;

  return {
    name: scenario.name,
    valuePerShare: round(valuePerShare),
    equityValue: round(equityValue),
    marginOfSafety: round(marginOfSafety),
    impliedUpside: round(impliedUpside)
  };
}

function calculateDcfPerShare({
  scenario,
  sharesOutstanding
}: {
  scenario: ValuationScenarioInput;
  sharesOutstanding: number;
}) {
  const discountRate = Math.max(scenario.discountRate, 0.01);
  const terminalGrowthRate = Math.min(scenario.terminalGrowthRate, discountRate - 0.005);
  let presentValue = 0;
  let fcf = scenario.basisAmount;

  for (let year = 1; year <= 5; year += 1) {
    fcf *= 1 + scenario.growthRate;
    presentValue += fcf / Math.pow(1 + discountRate, year);
  }

  const terminalValue = (fcf * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
  const presentTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);
  const equityValue = presentValue + presentTerminalValue;

  return sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;
}

function buildRiskFlags({
  templateType,
  currentPrice,
  sharesOutstanding,
  scenarios,
  baseValue
}: {
  templateType: ValuationTemplateType;
  currentPrice: number;
  sharesOutstanding: number;
  scenarios: ValuationScenarioInput[];
  baseValue: number;
}) {
  const flags: string[] = [];
  const baseScenario = scenarios.find((scenario) => scenario.name === "base");

  if (sharesOutstanding <= 0) {
    flags.push("总股本必须大于 0，否则每股估值不可靠。");
  }

  if (currentPrice > 0 && baseValue > 0 && currentPrice > baseValue) {
    flags.push("当前价格高于中性情景估值，安全边际为负。");
  }

  if (baseScenario && baseScenario.growthRate > 0.2) {
    flags.push("中性情景增长假设较高，需要反复验证增长来源。");
  }

  if (templateType === "manufacturing" && baseScenario && baseScenario.terminalGrowthRate >= baseScenario.discountRate - 0.01) {
    flags.push("永续增长率接近折现率，DCF 结果会非常敏感。");
  }

  if (templateType === "cyclical") {
    flags.push("周期股估值要避免使用景气顶部利润作为中枢利润。");
  }

  if (templateType === "financial") {
    flags.push("金融股 PB 估值必须结合资产质量、拨备和 ROE 可持续性。");
  }

  return flags;
}

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}
