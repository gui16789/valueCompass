export type AShareCaseStudy = {
  nodeId: string;
  companyName: string;
  stockCode: string;
  exchange: string;
  industry: string;
  caseTheme: string;
  businessSnapshot: string;
  researchValue: string;
  valuationTemplate: string;
  keyQuestions: string[];
  evidenceChecklist: string[];
  riskReminders: string[];
  sourceHints: string[];
  valuationWalkthrough?: AShareValuationWalkthrough;
};

export type AShareValuationWalkthrough = {
  dataAsOf: string;
  sourceNote: string;
  boundaryNote: string;
  preferredTools: Array<{
    name: string;
    reason: string;
    useCase: string;
  }>;
  financialInputs: Array<{
    label: string;
    value: string;
    source: string;
    useInValuation: string;
  }>;
  calculationSteps: string[];
  scenarios: Array<{
    name: string;
    assumptions: string[];
    formula: string;
    equityValueRange: string;
    perShareRange: string;
    interpretation: string;
  }>;
  peerComparison: Array<{
    dimension: string;
    advantages: string;
    watchouts: string;
  }>;
  longTermValueChecklist: Array<{
    question: string;
    whyItMatters: string;
  }>;
  knowledgeLinks: Array<{
    concept: string;
    application: string;
  }>;
};

const aShareCaseStudies: AShareCaseStudy[] = [
  {
    nodeId: "case-midea-000333",
    companyName: "美的集团",
    stockCode: "000333",
    exchange: "深交所",
    industry: "家电 / 成熟消费制造",
    caseTheme: "从家电龙头理解现金流、全球化和第二增长曲线",
    businessSnapshot: "公司以智能家居为基础，同时发展商业及工业解决方案、楼宇科技、机器人与自动化等业务，是观察成熟制造企业从 ToC 向 ToB 延展的典型样本。",
    researchValue: "适合训练“好生意是否还能继续变好”的判断：既要看品牌、渠道和规模效率，也要看海外扩张、B 端业务和资本开支会不会改变现金流质量。",
    valuationTemplate: "制造业模板为主，消费股 PE 情景作为交叉验证。",
    keyQuestions: [
      "智能家居主业的增长来自销量、价格、份额还是结构升级？",
      "ToB 业务扩张是否提升长期回报，还是增加周期和资本开支压力？",
      "海外收入增长能否抵消国内成熟市场的竞争和地产链影响？",
      "自由现金流、分红和回购能否持续支撑股东回报？"
    ],
    evidenceChecklist: [
      "分业务收入和毛利率变化",
      "经营现金流与净利润匹配度",
      "资本开支、研发投入和存货周转",
      "海外收入占比和汇率风险披露",
      "分红、回购和净现金状况"
    ],
    riskReminders: [
      "成熟行业增长放缓导致估值中枢下移。",
      "B 端业务可能带来更强周期性和更复杂的竞争格局。",
      "原材料、汇率和海外贸易环境会影响利润率。"
    ],
    sourceHints: ["巨潮资讯网 2025 年年度报告", "深交所定期报告披露", "公司官网投资者关系资料"],
    valuationWalkthrough: {
      dataAsOf: "2025 年年度报告，财务报表批准报出日为 2026-03-30",
      sourceNote:
        "示例数据来自美的集团 2025 年年度报告：营业收入 4564.52 亿元，归母净利润 439.45 亿元，经营活动现金流量净额 533.46 亿元，购建固定资产、无形资产和其他长期资产支付现金 111.42 亿元，期末总股本 75.971 亿股。",
      boundaryNote:
        "以下只是价值投资学习中的估值演算样例，不是实时估值，不构成买入、卖出或持有建议。用户应自行更新最新年报、季报、股本和市场价格后再判断。",
      preferredTools: [
        {
          name: "制造业所有者收益 / 自由现金流估值",
          reason:
            "美的属于成熟消费制造和多元制造平台，经营现金流、资本开支、分红和回购是判断股东回报的核心。",
          useCase:
            "先用经营现金流减维护性资本开支估算所有者收益，再给出悲观、中性、乐观倍数区间。"
        },
        {
          name: "消费股 PE 情景估值",
          reason:
            "智能家居主业具有消费属性，归母净利润和估值倍数可作为交叉验证，但不能单独替代现金流分析。",
          useCase:
            "用归母净利润乘以保守、中性、乐观 PE 区间，检查自由现金流估值是否过度乐观。"
        },
        {
          name: "反向 DCF",
          reason:
            "当市场价格较高时，反向 DCF 能倒推出市场隐含的长期增长和利润率要求。",
          useCase:
            "把当前市值倒推成未来 5-10 年自由现金流增长要求，再判断这些要求是否被业务证据支持。"
        }
      ],
      financialInputs: [
        {
          label: "营业收入",
          value: "4564.52 亿元",
          source: "2025 年报主要会计数据和利润表",
          useInValuation: "用于判断公司规模、增长基础和分业务收入拆分是否支撑估值假设。"
        },
        {
          label: "归母净利润",
          value: "439.45 亿元",
          source: "2025 年报主要会计数据",
          useInValuation: "用于 PE 情景估值和利润质量交叉验证。"
        },
        {
          label: "经营活动现金流量净额",
          value: "533.46 亿元",
          source: "2025 年报现金流量表",
          useInValuation: "用于判断利润是否转化为现金，是所有者收益估值的起点。"
        },
        {
          label: "购建固定资产、无形资产和其他长期资产支付现金",
          value: "111.42 亿元",
          source: "2025 年报现金流量表",
          useInValuation: "作为资本开支近似值；教学估算中用经营现金流减该项得到自由现金流。"
        },
        {
          label: "教学口径自由现金流",
          value: "约 422.04 亿元",
          source: "533.46 亿元经营现金流 - 111.42 亿元资本开支",
          useInValuation: "作为三情景估值的基础自由现金流；实际研究还需区分维护性和扩张性资本开支。"
        },
        {
          label: "期末总股本",
          value: "约 75.971 亿股",
          source: "2025 年报财务报表附注股本",
          useInValuation: "用于把股权价值区间换算为每股价值区间。"
        },
        {
          label: "2025 年度现金分红方案",
          value: "每 10 股派发现金 43 元，含中期分红",
          source: "2025 年报利润分配方案",
          useInValuation: "用于检查股东回报、现金流覆盖和资本配置纪律。"
        }
      ],
      calculationSteps: [
        "第一步：确认公司类型。美的不是纯消费股，也不是强周期股，第一工具选制造业所有者收益 / 自由现金流估值。",
        "第二步：从年报现金流量表取经营现金流 533.46 亿元，再减购建固定资产等长期资产现金流出 111.42 亿元，得到教学口径自由现金流约 422.04 亿元。",
        "第三步：判断这 422.04 亿元是否是常态。需要检查过去 3-5 年经营现金流、资本开支、存货、应收和海外收入，而不是只用单年数字。",
        "第四步：设置三情景。悲观情景降低自由现金流并降低倍数；中性情景使用接近当前现金流的区间；乐观情景要求海外、B 端业务和效率提升能支撑更高现金流和倍数。",
        "第五步：用股权价值 = 常态自由现金流 x 合理倍数，得到总市值区间；再除以总股本约 75.971 亿股，得到每股教学价值区间。",
        "第六步：用 PE 情景估值交叉验证。归母净利润 439.45 亿元 x 12-18 倍，对比自由现金流法是否明显偏离。",
        "第七步：把估值结果和当前市场价格比较时，只能形成安全边际检查，不自动生成买入、卖出或持有建议。"
      ],
      scenarios: [
        {
          name: "悲观情景",
          assumptions: [
            "国内家电需求成熟，收入增速放缓。",
            "海外、B 端业务带来增长，但毛利率和资本开支压力抵消一部分收益。",
            "常态自由现金流按 380-410 亿元估算，合理倍数按 10-12 倍。"
          ],
          formula: "380-410 亿元自由现金流 x 10-12 倍",
          equityValueRange: "约 3800-4920 亿元",
          perShareRange: "约 50-65 元 / 股",
          interpretation:
            "用于压力测试：如果成熟制造估值中枢下移，当前判断是否仍有足够保护。"
        },
        {
          name: "中性情景",
          assumptions: [
            "智能家居主业保持稳定，海外业务和商业及工业解决方案继续贡献温和增长。",
            "经营现金流质量维持，资本开支处于可控区间。",
            "常态自由现金流按 420-470 亿元估算，合理倍数按 13-15 倍。"
          ],
          formula: "420-470 亿元自由现金流 x 13-15 倍",
          equityValueRange: "约 5460-7050 亿元",
          perShareRange: "约 72-93 元 / 股",
          interpretation:
            "用于基准判断：公司维持成熟龙头现金流质量，但不假设估值显著扩张。"
        },
        {
          name: "乐观情景",
          assumptions: [
            "海外收入、B 端业务和工业技术等第二曲线持续兑现。",
            "规模效率、品牌渠道和资本配置共同提升自由现金流。",
            "常态自由现金流按 480-540 亿元估算，合理倍数按 16-18 倍。"
          ],
          formula: "480-540 亿元自由现金流 x 16-18 倍",
          equityValueRange: "约 7680-9720 亿元",
          perShareRange: "约 101-128 元 / 股",
          interpretation:
            "用于检验乐观叙事：必须有海外增长、B 端盈利质量和现金流持续改善的证据支持。"
        }
      ],
      peerComparison: [
        {
          dimension: "与格力电器比较",
          advantages:
            "美的业务更分散，智能家居、商业及工业解决方案、海外收入共同构成多引擎；现金流、分红和回购也适合观察股东回报。",
          watchouts:
            "业务更复杂，ToB 和海外业务会引入更多周期、汇率、整合和资本开支变量，不能只按传统白电估值。"
        },
        {
          dimension: "与海尔智家比较",
          advantages:
            "美的在制造效率、品类覆盖和 B 端延展上有平台化特征，适合研究成熟制造企业第二增长曲线。",
          watchouts:
            "海尔智家全球品牌和海外本土化也有独特优势；比较时要看海外毛利率、费用率、现金流和组织效率，而不是只看收入规模。"
        },
        {
          dimension: "与小熊电器、石头科技等细分消费制造比较",
          advantages:
            "美的规模、渠道、供应链、品类和现金流稳定性更强，更适合成熟龙头估值。",
          watchouts:
            "大型平台的增速通常低于优秀细分成长公司，估值倍数不能简单套用高成长小家电或科技消费品。"
        }
      ],
      longTermValueChecklist: [
        {
          question: "长期是否仍能创造高质量自由现金流？",
          whyItMatters: "成熟制造龙头的长期价值最终要靠经营现金流、资本开支纪律、分红和回购共同验证。"
        },
        {
          question: "海外和 B 端第二曲线是否提高回报率，而不是稀释现金流？",
          whyItMatters: "第二增长曲线如果只带来收入，不带来可持续利润和现金流，估值应更保守。"
        },
        {
          question: "护城河是否仍在变宽？",
          whyItMatters: "品牌、渠道、供应链和规模效率需要持续用份额、毛利率、费用率和库存验证。"
        },
        {
          question: "资本配置是否持续对股东友好？",
          whyItMatters: "分红、回购、并购、研发和扩产共同决定长期复利质量。"
        },
        {
          question: "价格是否给了足够安全边际？",
          whyItMatters: "好公司也可能因为买入价格过高而带来普通回报，估值必须和价格比较。"
        }
      ],
      knowledgeLinks: [
        {
          concept: "股票背后是企业",
          application: "先理解智能家居、商业及工业解决方案、海外业务分别如何赚钱。"
        },
        {
          concept: "所有者收益 / 自由现金流",
          application: "用经营现金流减资本开支，估算可归属股东的现金创造能力。"
        },
        {
          concept: "护城河",
          application: "用品牌、渠道、规模效率、供应链和海外本土化验证竞争优势。"
        },
        {
          concept: "好公司与好价格",
          application: "即使公司质量较高，也必须比较当前价格和保守价值区间。"
        },
        {
          concept: "安全边际",
          application: "通过悲观情景、倍数压缩和现金流下修测试错误容忍度。"
        },
        {
          concept: "反方验证",
          application: "主动检查地产链、汇率、原材料、海外贸易、B 端周期和资本开支风险。"
        }
      ]
    }
  },
  {
    nodeId: "case-moutai-600519",
    companyName: "贵州茅台",
    stockCode: "600519",
    exchange: "上交所",
    industry: "白酒 / 高端消费",
    caseTheme: "从高端白酒理解品牌、渠道、定价权和估值溢价边界",
    businessSnapshot: "公司主营茅台酒及系列酒，是研究品牌稀缺性、渠道秩序、预收款和高 ROE 的经典 A 股消费样本。",
    researchValue: "适合训练“护城河不是口号”的证据化研究：品牌、产能、渠道、价格体系和现金流都要能相互验证。",
    valuationTemplate: "消费股模板为主，安全边际和情景估值必须保守处理。",
    keyQuestions: [
      "收入增长主要来自量、价、产品结构还是渠道变化？",
      "渠道库存、批价和直销占比如何影响真实需求判断？",
      "高毛利和高 ROE 的可持续来源是什么？",
      "高质量公司在高估值时可能面对什么长期回报风险？"
    ],
    evidenceChecklist: [
      "茅台酒与系列酒收入拆分",
      "毛利率、净利率和 ROE 趋势",
      "合同负债、经营现金流和渠道数据",
      "产能建设和基酒储备披露",
      "分红政策和资本配置"
    ],
    riskReminders: [
      "消费场景、礼赠需求和渠道价格可能发生周期性变化。",
      "高品牌质量不等于任何价格都合理。",
      "估值需要覆盖增长放缓和情绪降温的可能性。"
    ],
    sourceHints: ["公司年度报告", "上交所公告", "公司投资者关系资料"]
  },
  {
    nodeId: "case-cmb-600036",
    companyName: "招商银行",
    stockCode: "600036",
    exchange: "上交所",
    industry: "银行 / 金融股",
    caseTheme: "从零售银行理解 PB-ROE、资产质量和拨备安全垫",
    businessSnapshot: "公司长期以零售金融、财富管理和风险定价能力为市场关注点，是理解银行估值不能只看破净的典型案例。",
    researchValue: "适合训练金融股估值：PB 需要和 ROE、净息差、不良率、拨备覆盖率、资本充足率一起看。",
    valuationTemplate: "金融股 PB-ROE 模板。",
    keyQuestions: [
      "ROE 下降是周期压力、息差压力还是风险成本变化造成的？",
      "不良率、关注贷款和拨备覆盖率是否支持资产质量判断？",
      "财富管理和零售业务的护城河是否仍然存在？",
      "资本充足率、分红和内生增长之间如何平衡？"
    ],
    evidenceChecklist: [
      "ROE、ROA、净息差和成本收入比",
      "不良贷款率、拨备覆盖率和关注贷款率",
      "零售贷款、公司贷款和财富管理数据",
      "资本充足率和核心一级资本充足率",
      "分红率和风险加权资产变化"
    ],
    riskReminders: [
      "银行盈利会受宏观信用周期和利率环境影响。",
      "破净可能反映资产质量和 ROE 下行预期。",
      "零售业务优势也需要持续用数据验证。"
    ],
    sourceHints: ["公司年度报告", "上交所公告", "监管指标披露"]
  },
  {
    nodeId: "case-shenhua-601088",
    companyName: "中国神华",
    stockCode: "601088",
    exchange: "上交所",
    industry: "煤炭 / 综合能源",
    caseTheme: "从煤电运一体化理解周期股的中枢利润和股东回报",
    businessSnapshot: "公司业务覆盖煤炭、发电、运输等环节，是观察资源品企业如何通过一体化降低周期波动的样本。",
    researchValue: "适合训练周期股研究：不能用景气顶部利润直接估值，要看产量、煤价、电价、运力、成本和分红可持续性。",
    valuationTemplate: "周期股模板，使用跨周期中枢利润。",
    keyQuestions: [
      "当前利润处于煤价周期的什么位置？",
      "煤炭、发电、铁路港口等业务如何相互平滑波动？",
      "资本开支和能源转型会如何影响自由现金流？",
      "高分红是否由真实现金流支撑？"
    ],
    evidenceChecklist: [
      "商品煤产量、销量和平均售价",
      "发电量、售电价格和燃料成本",
      "铁路、港口和航运周转数据",
      "经营现金流、资本开支和分红比例",
      "煤价下行情景下的利润压力测试"
    ],
    riskReminders: [
      "商品价格下行会快速压缩利润。",
      "能源政策和安全环保要求会影响产能和成本。",
      "高股息不能替代对周期中枢的判断。"
    ],
    sourceHints: ["公司年度报告", "上交所公告", "行业价格与产量公开数据"]
  },
  {
    nodeId: "case-wanhua-600309",
    companyName: "万华化学",
    stockCode: "600309",
    exchange: "上交所",
    industry: "化工 / 周期制造",
    caseTheme: "从 MDI 与化工平台理解成本优势、周期价差和资本开支",
    businessSnapshot: "公司业务覆盖聚氨酯、石化、精细化学品及新材料，是研究周期制造企业从单一产品走向平台化的样本。",
    researchValue: "适合训练“好公司也有周期”的判断：技术、成本和规模优势可能很强，但利润仍会受价差、产能和需求影响。",
    valuationTemplate: "周期股模板为主，制造业 DCF 作为长期现金流校验。",
    keyQuestions: [
      "核心产品价差处于周期什么位置？",
      "新增产能会强化成本优势还是放大周期风险？",
      "新材料业务能否降低单一产品周期暴露？",
      "高资本开支阶段的自由现金流是否仍可接受？"
    ],
    evidenceChecklist: [
      "聚氨酯、石化、新材料分部收入和毛利率",
      "主要产品价格、价差和开工率",
      "在建工程、资本开支和折旧压力",
      "负债率、现金流和库存变化",
      "海外扩张和安全环保披露"
    ],
    riskReminders: [
      "周期顶部利润容易让估值过度乐观。",
      "扩产和价格下行同时出现会压缩回报。",
      "化工安全、环保和海外经营风险需要单独检查。"
    ],
    sourceHints: ["公司年度报告", "上交所公告", "产品价格与价差公开数据"]
  },
  {
    nodeId: "case-catl-300750",
    companyName: "宁德时代",
    stockCode: "300750",
    exchange: "深交所",
    industry: "动力电池 / 新能源制造",
    caseTheme: "从动力电池龙头理解技术迭代、份额、储能和反向 DCF",
    businessSnapshot: "公司主营动力电池和储能电池系统，是观察高成长制造企业如何面对技术迭代、价格竞争和全球化的核心样本。",
    researchValue: "适合训练成长股估值纪律：赛道空间很大不等于股东回报确定，必须拆解份额、价格、毛利率、资本开支和隐含增长。",
    valuationTemplate: "制造业模板与反向 DCF 结合。",
    keyQuestions: [
      "增长来自动力电池、储能、海外客户还是新应用场景？",
      "价格竞争下毛利率是否能维持？",
      "技术路线变化会不会削弱现有优势？",
      "当前估值隐含了怎样的长期份额和利润率？"
    ],
    evidenceChecklist: [
      "动力电池和储能收入、出货与毛利率",
      "研发投入、专利和新产品披露",
      "客户集中度和海外收入变化",
      "资本开支、产能利用率和存货",
      "反向 DCF 隐含增长率"
    ],
    riskReminders: [
      "高成长行业容易出现价格战和产能过剩。",
      "技术路线迭代可能改变竞争格局。",
      "海外市场、贸易政策和客户结构会影响长期估值。"
    ],
    sourceHints: ["公司年度报告", "深交所公告", "公司官网投资者资料"]
  },
  {
    nodeId: "case-longi-601012",
    companyName: "隆基绿能",
    stockCode: "601012",
    exchange: "上交所",
    industry: "光伏 / 新能源制造",
    caseTheme: "从光伏龙头理解产能周期、技术路线和价值陷阱排查",
    businessSnapshot: "公司覆盖硅片、电池和组件等环节，是研究高景气行业进入供需错配后如何重估的典型案例。",
    researchValue: "适合训练“好赛道不等于好投资”的反常识：行业需求增长可能存在，但价格、产能和资产减值仍会决定股东回报。",
    valuationTemplate: "周期制造模板，重点做悲观情景和资产减值检查。",
    keyQuestions: [
      "行业供需什么时候可能重新平衡？",
      "技术路线变化会不会导致旧产能减值？",
      "组件、硅片和电池的盈利能力是否同步修复？",
      "现金流能否覆盖资本开支和周期底部亏损？"
    ],
    evidenceChecklist: [
      "硅片、电池、组件出货量和毛利率",
      "存货、固定资产和资产减值",
      "资本开支、现金余额和负债压力",
      "技术路线和量产效率披露",
      "行业价格和新增产能数据"
    ],
    riskReminders: [
      "供需错配会让收入增长和利润表现背离。",
      "技术迭代可能带来资产减值。",
      "周期底部需要优先检查现金流和资产负债表。"
    ],
    sourceHints: ["公司年度报告", "上交所公告", "行业价格与产能公开数据"]
  },
  {
    nodeId: "case-hengrui-600276",
    companyName: "恒瑞医药",
    stockCode: "600276",
    exchange: "上交所",
    industry: "创新药 / 医药研发",
    caseTheme: "从创新药理解研发投入、管线风险和估值边界",
    businessSnapshot: "公司从传统制药向创新药和国际化授权转型，是研究研发驱动企业如何从投入走向商业化的案例。",
    researchValue: "适合训练医药创新公司的证据链：研发投入不是价值本身，关键是管线质量、商业化能力、支付环境和海外授权兑现。",
    valuationTemplate: "制造业模板不完全适配，需结合管线分阶段情景和安全边际。",
    keyQuestions: [
      "创新药收入占比提升是否来自可持续产品组合？",
      "研发投入对应的临床阶段、适应症和竞争格局如何？",
      "集采、医保谈判和支付政策如何影响利润率？",
      "海外授权收入能否成为稳定第二曲线？"
    ],
    evidenceChecklist: [
      "创新药收入、传统药收入和毛利率变化",
      "研发投入金额、费用化比例和人员结构",
      "临床管线、获批产品和授权交易披露",
      "销售费用、医保政策和价格压力",
      "经营现金流和研发资本化口径"
    ],
    riskReminders: [
      "临床失败和商业化不及预期会显著影响估值。",
      "政策支付和价格谈判会改变盈利模型。",
      "高研发投入需要区分投入强度和产出效率。"
    ],
    sourceHints: ["公司年度报告", "上交所公告", "药品审评和医保政策公开信息"]
  }
];

export const featuredAShareCaseIds = aShareCaseStudies.map((study) => study.nodeId);

export function getAShareCaseStudy(nodeId: string) {
  return aShareCaseStudies.find((study) => study.nodeId === nodeId) ?? null;
}
