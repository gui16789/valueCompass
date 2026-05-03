import Link from "next/link";
import {
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  FileSearch,
  GitCompare,
  LineChart,
  ListChecks,
  Scale,
  ShieldAlert
} from "lucide-react";
import type { AShareCaseStudy } from "@/lib/learning/a-share-cases";

type AShareCasePanelProps = {
  caseStudy: AShareCaseStudy;
};

export function AShareCasePanel({ caseStudy }: AShareCasePanelProps) {
  const walkthrough = caseStudy.valuationWalkthrough;
  const mentorDraft = `请作为耐心的价值投资导师，带我研究这个 A 股案例：${caseStudy.companyName}（${caseStudy.stockCode}）。不要给买入、卖出或持有建议，只帮助我理解业务、关键变量、估值模板、证据清单和风险。案例主题=${caseStudy.caseTheme}；估值模板=${caseStudy.valuationTemplate}；关键问题=${caseStudy.keyQuestions.join("；")}；${walkthrough ? `估值教学边界=${walkthrough.boundaryNote}；三情景=${walkthrough.scenarios.map((scenario) => `${scenario.name}:${scenario.equityValueRange}`).join("；")}。` : ""}`;
  const opponentDraft = `请作为投资委员会反方委员，质疑我研究 ${caseStudy.companyName}（${caseStudy.stockCode}）时可能遗漏的证据和过度乐观假设。不要给买入、卖出或持有建议。业务快照=${caseStudy.businessSnapshot}；关键风险=${caseStudy.riskReminders.join("；")}；证据清单=${caseStudy.evidenceChecklist.join("；")}；${walkthrough ? `估值过程=${walkthrough.scenarios.map((scenario) => `${scenario.name}假设:${scenario.assumptions.join("、")}`).join("；")}。` : ""}`;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
            <Building2 className="h-4 w-4" aria-hidden />
            <span>{caseStudy.companyName}</span>
            <span>({caseStudy.stockCode})</span>
            <span>/</span>
            <span>{caseStudy.exchange}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{caseStudy.caseTheme}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{caseStudy.businessSnapshot}</p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
          {caseStudy.industry}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoBlock title="研究价值" value={caseStudy.researchValue} />
        <InfoBlock title="估值工具" value={caseStudy.valuationTemplate} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <ListBlock title="关键问题" items={caseStudy.keyQuestions} />
        <ListBlock title="证据清单" items={caseStudy.evidenceChecklist} />
        <ListBlock title="风险提醒" items={caseStudy.riskReminders} />
      </div>

      {caseStudy.researchDossier ? <ResearchDossier caseStudy={caseStudy} /> : null}

      {walkthrough ? <ValuationWalkthrough caseStudy={caseStudy} /> : null}

      <div className="mt-5 rounded-md border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <FileSearch className="h-4 w-4" aria-hidden />
          资料来源提示
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {caseStudy.sourceHints.map((source) => (
            <span key={source} className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
              {source}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/mentor?role=mentor&draft=${encodeURIComponent(mentorDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <Bot className="h-4 w-4" aria-hidden />
          让导师带我研究
        </Link>
        <Link
          href={`/mentor?role=opponent&draft=${encodeURIComponent(opponentDraft)}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden />
          让反方委员质疑
        </Link>
      </div>
    </div>
  );
}

function ResearchDossier({ caseStudy }: { caseStudy: AShareCaseStudy }) {
  const dossier = caseStudy.researchDossier;

  if (!dossier) {
    return null;
  }

  return (
    <section className="mt-6 rounded-lg border border-border bg-background p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <FileSearch className="h-4 w-4" aria-hidden />
        标准化研究档案
      </div>
      <h3 className="mt-2 text-lg font-semibold">{caseStudy.companyName} 研究档案</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{dossier.boundaryNote}</p>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {dossier.sections.map((section, index) => (
          <details
            key={section.title}
            className="rounded-md border border-border bg-card p-4 open:bg-card"
            open={index < 4}
          >
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              {section.title}
            </summary>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.summary}</p>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => (
                <div key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ValuationWalkthrough({ caseStudy }: { caseStudy: AShareCaseStudy }) {
  const walkthrough = caseStudy.valuationWalkthrough;

  if (!walkthrough) {
    return null;
  }

  return (
    <section className="mt-6 space-y-5 rounded-lg border border-border bg-background p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Calculator className="h-4 w-4" aria-hidden />
            估值评估过程
          </div>
          <h3 className="mt-2 text-lg font-semibold">如何用财报推演 {caseStudy.companyName} 的价值范围</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{walkthrough.boundaryNote}</p>
        </div>
        <span className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
          {walkthrough.dataAsOf}
        </span>
      </div>

      <InfoBlock title="数据来源与教学口径" value={walkthrough.sourceNote} />

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Scale className="h-4 w-4" aria-hidden />
          估值方法选择：为什么 {caseStudy.companyName} 不直接套用单一公式
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {walkthrough.methodSelection.map((method) => (
            <div key={method.method} className="rounded-md border border-border bg-background p-4">
              <h4 className="font-semibold">{method.method}</h4>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">常用公式：</span>
                  {method.typicalFormula}
                </p>
                <p>
                  <span className="font-semibold text-foreground">适用对象：</span>
                  {method.suitableFor}
                </p>
                <p>
                  <span className="font-semibold text-foreground">套到{caseStudy.companyName}：</span>
                  {method.mideaFit}
                </p>
                <p>
                  <span className="font-semibold text-foreground">本案例决策：</span>
                  {method.decision}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Calculator className="h-4 w-4" aria-hidden />
          主公式：{walkthrough.primaryFormula.name}
        </div>
        <p className="mt-3 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold leading-6">
          {walkthrough.primaryFormula.formula}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{walkthrough.primaryFormula.whyPrimary}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {walkthrough.primaryFormula.inputExplanation.map((item) => (
            <div key={item} className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {walkthrough.preferredTools.map((tool) => (
          <div key={tool.name} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Scale className="h-4 w-4" aria-hidden />
              {tool.name}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.reason}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.useCase}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <FileSearch className="h-4 w-4" aria-hidden />
          财报取数路径
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {walkthrough.financialInputs.map((input) => (
            <div key={input.label} className="rounded-md border border-border bg-background p-3">
              <div className="text-sm font-semibold">{input.label}</div>
              <div className="mt-1 text-lg font-semibold text-primary">{input.value}</div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">来源：{input.source}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{input.useInValuation}</p>
            </div>
          ))}
        </div>
      </div>

      <ListBlock title="计算步骤" items={walkthrough.calculationSteps} />

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <LineChart className="h-4 w-4" aria-hidden />
          悲观 / 中性 / 乐观三情景
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-3">
          {walkthrough.scenarios.map((scenario) => (
            <div key={scenario.name} className="rounded-md border border-border bg-background p-4">
              <h4 className="font-semibold">{scenario.name}</h4>
              <div className="mt-3 space-y-2">
                {scenario.assumptions.map((assumption) => (
                  <div key={assumption} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{assumption}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-border bg-card p-3 text-sm">
                <div className="font-semibold text-primary">公式</div>
                <p className="mt-1 leading-6 text-muted-foreground">{scenario.formula}</p>
              </div>
              <div className="mt-3 rounded-md border border-border bg-card p-3">
                <div className="text-sm font-semibold text-primary">手把手代入</div>
                <div className="mt-2 space-y-2">
                  {scenario.formulaSteps.map((step) => (
                    <div key={step} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <MetricBox label="股权价值区间" value={scenario.equityValueRange} />
                <MetricBox label="每股教学区间" value={scenario.perShareRange} />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{scenario.interpretation}</p>
            </div>
          ))}
        </div>
      </div>

      {walkthrough.forecastValuation ? <ForecastValuation walkthrough={walkthrough.forecastValuation} /> : null}

      <StructuredBlock
        icon={<Calculator className="h-4 w-4" aria-hidden />}
        title="交叉验证：不用单一公式说服自己"
        items={walkthrough.crossChecks.map(
          (item) => `${item.method}：${item.formula}；结果：${item.result}；教学意义：${item.lesson}`
        )}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <StructuredBlock
          icon={<GitCompare className="h-4 w-4" aria-hidden />}
          title="同行比较：优势与需要警惕的地方"
          items={walkthrough.peerComparison.map(
            (item) => `${item.dimension}：优势：${item.advantages} 需要警惕：${item.watchouts}`
          )}
        />
        <StructuredBlock
          icon={<ListChecks className="h-4 w-4" aria-hidden />}
          title="长期价值研究检查"
          items={walkthrough.longTermValueChecklist.map(
            (item) => `${item.question}：${item.whyItMatters}`
          )}
        />
      </div>

      <StructuredBlock
        icon={<ListChecks className="h-4 w-4" aria-hidden />}
        title="应用到的价值投资知识点"
        items={walkthrough.knowledgeLinks.map((item) => `${item.concept}：${item.application}`)}
      />
    </section>
  );
}

function ForecastValuation({
  walkthrough
}: {
  walkthrough: NonNullable<AShareCaseStudy["valuationWalkthrough"]>["forecastValuation"];
}) {
  if (!walkthrough) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <LineChart className="h-4 w-4" aria-hidden />
        {walkthrough.title}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{walkthrough.sourceNote}</p>
      <div className="mt-3 rounded-md border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
        参考价格口径：{walkthrough.referencePrice}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {walkthrough.baseData.map((item) => (
          <div key={item.label} className="rounded-md border border-border bg-background p-3">
            <div className="text-xs font-semibold text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-primary">{item.value}</div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        {walkthrough.methodNotes.map((item) => (
          <div key={item.method} className="rounded-md border border-border bg-background p-3">
            <div className="text-sm font-semibold">{item.method}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.use}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">注意：{item.caution}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {walkthrough.scenarios.map((scenario) => (
          <div key={scenario.name} className="rounded-md border border-border bg-background p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h4 className="font-semibold">{scenario.name}</h4>
              <span className="w-fit rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground">
                教学权重：{scenario.probability}
              </span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {scenario.assumptions.map((assumption) => (
                <div key={assumption} className="rounded-md border border-border bg-card px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {assumption}
                </div>
              ))}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">年份</th>
                    <th className="py-2 pr-3 font-semibold">利润假设</th>
                    <th className="py-2 pr-3 font-semibold">PE 倍数</th>
                    <th className="py-2 pr-3 font-semibold">股权价值</th>
                    <th className="py-2 pr-3 font-semibold">每股推演值</th>
                    <th className="py-2 font-semibold">与参考价关系</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.rows.map((row) => (
                    <tr key={`${scenario.name}-${row.year}`} className="border-b border-border/60 last:border-b-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.netProfit}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.multiple}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.equityValue}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.perShareValue}</td>
                      <td className="py-2 text-muted-foreground">{row.comparison}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-[220px_1fr]">
              <MetricBox label="教学推演区间" value={scenario.teachingRange} />
              <p className="rounded-md border border-border bg-card p-3 text-sm leading-6 text-muted-foreground">{scenario.lesson}</p>
            </div>
          </div>
        ))}
      </div>

      <InfoBlock title="概率加权教学值" value={`${walkthrough.weightedResult.formula}；${walkthrough.weightedResult.result}。${walkthrough.weightedResult.lesson}`} />
      <ListBlock title="需要修正的常见推理错误" items={walkthrough.corrections} />
      <ListBlock title="使用这个模型前必须确认" items={walkthrough.boundaryNotes} />
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function StructuredBlock({
  icon,
  title,
  items
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        {icon}
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="text-sm font-semibold text-primary">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="text-sm font-semibold text-primary">{title}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
