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

export type SensitivityCell = {
  rowLabel: string;
  columnLabel: string;
  valuePerShare: number;
  marginOfSafety: number;
};

export type ValuationSensitivityMatrix = {
  rowAxisLabel: string;
  columnAxisLabel: string;
  rows: string[];
  columns: string[];
  cells: SensitivityCell[];
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

export function calculateValuationSensitivity({
  templateType,
  currentPrice,
  sharesOutstanding,
  baseScenario
}: {
  templateType: ValuationTemplateType;
  currentPrice: number;
  sharesOutstanding: number;
  baseScenario: ValuationScenarioInput;
}): ValuationSensitivityMatrix {
  const growthSteps = [-0.02, 0, 0.02];
  const multipleSteps = [-0.15, 0, 0.15];
  const discountSteps = [-0.01, 0, 0.01];
  const terminalSteps = [-0.005, 0, 0.005];
  const isManufacturing = templateType === "manufacturing";
  const rowAxisLabel = isManufacturing ? "折现率" : "增长率";
  const columnAxisLabel = isManufacturing ? "永续增长率" : "估值倍数";
  const rowSteps = isManufacturing ? discountSteps : growthSteps;
  const columnSteps = isManufacturing ? terminalSteps : multipleSteps;
  const rows = rowSteps.map((step) =>
    isManufacturing
      ? formatPercentLabel(baseScenario.discountRate + step)
      : formatPercentLabel(baseScenario.growthRate + step)
  );
  const columns = columnSteps.map((step) =>
    isManufacturing
      ? formatPercentLabel(baseScenario.terminalGrowthRate + step)
      : formatMultipleLabel(baseScenario.valuationMultiple * (1 + step))
  );

  const cells = rowSteps.flatMap((rowStep, rowIndex) =>
    columnSteps.map((columnStep, columnIndex) => {
      const scenario = {
        ...baseScenario,
        growthRate: isManufacturing ? baseScenario.growthRate : Math.max(baseScenario.growthRate + rowStep, -0.95),
        valuationMultiple: isManufacturing
          ? baseScenario.valuationMultiple
          : Math.max(baseScenario.valuationMultiple * (1 + columnStep), 0),
        discountRate: isManufacturing ? Math.max(baseScenario.discountRate + rowStep, 0.01) : baseScenario.discountRate,
        terminalGrowthRate: isManufacturing
          ? Math.max(baseScenario.terminalGrowthRate + columnStep, -0.95)
          : baseScenario.terminalGrowthRate
      };
      const result = calculateScenario({ templateType, currentPrice, sharesOutstanding, scenario });

      return {
        rowLabel: rows[rowIndex],
        columnLabel: columns[columnIndex],
        valuePerShare: result.valuePerShare,
        marginOfSafety: result.marginOfSafety
      };
    })
  );

  return {
    rowAxisLabel,
    columnAxisLabel,
    rows,
    columns,
    cells
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

function formatPercentLabel(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMultipleLabel(value: number) {
  return `${value.toFixed(1)}x`;
}
