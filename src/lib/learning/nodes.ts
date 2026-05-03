export type KnowledgeNodeType = "timeline" | "school" | "person" | "book" | "concept" | "case";

export type KnowledgeNode = {
  id: string;
  type: KnowledgeNodeType;
  title: string;
  period: string;
  school: string;
  summary: string;
  coreIdeas: string[];
  books: string[];
  aShareNotes: string[];
  misunderstandings: string[];
  practiceActions: string[];
  relatedIds: string[];
  order: number;
};

export const nodeTypeLabels: Record<KnowledgeNodeType, string> = {
  timeline: "时间线",
  school: "学派",
  person: "人物",
  book: "书籍",
  concept: "概念",
  case: "A 股案例"
};

const sharedBoundary = [
  "只用于理解方法和建立研究框架，不构成任何具体证券的买卖建议。"
];

const rawKnowledgeNodes: KnowledgeNode[] = [
  {
    id: "timeline-security-analysis",
    type: "timeline",
    title: "早期证券分析思想",
    period: "1900s-1930s",
    school: "证券分析",
    summary: "股票从投机票据逐渐被看作企业所有权，财务报表、资产价值和偿债能力开始成为分析基础。",
    coreIdeas: ["股票背后是企业", "资产负债表是风险底线", "价格必须和价值比较", "证据先于故事", "先防守再进攻"],
    books: ["《证券分析》"],
    aShareNotes: [
      "适合理解低估资产、破净公司和周期底部研究，但不能只看账面便宜。",
      "A 股公司常有存货、应收、商誉、关联交易等资产质量差异，证券分析第一步是排雷。",
      "财报口径、行业周期和治理结构会影响资产价值，账面数需要转成保守可验证的价值。"
    ],
    misunderstandings: [
      "把低 PB 简单等同于低风险。",
      "只看资产不看资产能否变现。",
      "把年报里的叙事当作已经验证的事实。"
    ],
    practiceActions: [
      "读一家公司资产负债表，标记现金、负债、存货和应收账款。",
      "把一个投资观点拆成事实、推断、观点和待确认信息。",
      "用保守口径重估一次净资产，并写出最可能减值的资产。"
    ],
    relatedIds: ["book-security-analysis", "concept-intrinsic-value", "concept-margin-of-safety"],
    order: 1
  },
  {
    id: "timeline-graham-dodd",
    type: "timeline",
    title: "格雷厄姆与多德",
    period: "1934",
    school: "深度价值",
    summary: "格雷厄姆和多德把证券分析系统化，提出安全边际、市场先生和防御型投资者等核心框架。",
    coreIdeas: ["安全边际", "市场先生", "防御优先", "低估组合", "防御型投资者"],
    books: ["《证券分析》", "《聪明的投资者》"],
    aShareNotes: [
      "A 股中可用于识别估值修复机会，但必须额外检查治理、退市风险和资产真实性。",
      "格雷厄姆方法适合训练纪律：先问本金保护，再问上涨空间。",
      "对于周期和困境公司，要把安全边际拆成资产安全、现金流安全和价格安全。"
    ],
    misunderstandings: [
      "以为越便宜越好，忽略价值陷阱。",
      "以为市场先生意味着每次下跌都要行动。",
      "把防御型投资者理解成不研究、不判断。"
    ],
    practiceActions: [
      "挑选一家公司，写出价格低估成立需要满足的三个事实。",
      "写一份市场先生情绪清单：哪些是报价，哪些是基本面变化。",
      "为一家公司写出防御型投资者会拒绝它的理由。"
    ],
    relatedIds: ["person-benjamin-graham", "person-david-dodd", "concept-market-mr"],
    order: 2
  },
  {
    id: "timeline-buffett-early",
    type: "timeline",
    title: "巴菲特早期",
    period: "1950s-1960s",
    school: "烟蒂投资",
    summary: "巴菲特早期继承格雷厄姆方法，偏好清算价值、净流动资产和低估组合。",
    coreIdeas: ["买得足够便宜", "分散低估组合", "重视清算价值", "催化因素", "时间成本"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "A 股烟蒂机会常伴随信息质量、治理和壳价值变化，不能只看估值倍数。",
      "低价、低市值、破净公司需要额外检查退市、诉讼、资产减值和控股股东风险。",
      "烟蒂方法更像一组经过排雷的组合策略，不适合把全部判断压在单一公司上。"
    ],
    misunderstandings: [
      "忽略时间成本和基本面继续恶化。",
      "把股价低、跌幅大当成烟蒂投资。",
      "只算静态清算价值，不问价值释放路径。"
    ],
    practiceActions: [
      "比较一家低估公司近三年的现金流和利润质量。",
      "写出低估修复需要的催化因素，以及如果催化不出现怎么办。",
      "建立烟蒂排雷清单：退市、债务、商誉、应收、关联交易。"
    ],
    relatedIds: ["school-cigar-butt", "school-deep-value", "person-warren-buffett"],
    order: 3
  },
  {
    id: "timeline-buffett-munger",
    type: "timeline",
    title: "巴菲特与芒格转向好生意",
    period: "1970s-1990s",
    school: "质量投资",
    summary: "芒格推动巴菲特从只买便宜货转向以合理价格买优秀公司，强调护城河、管理层和长期复利。",
    coreIdeas: ["好公司合理价格", "护城河", "长期复利", "少数高质量机会", "资本配置"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "适合研究消费、家电、医药等长期商业模式，但高质量不代表任何价格都合理。",
      "A 股里的优秀公司也会受到渠道变化、政策周期、产能周期和估值情绪影响。",
      "质量投资需要同时验证商业模式质量、财务质量、管理层资本配置和买入价格。"
    ],
    misunderstandings: [
      "把龙头、品牌和高 ROE 直接等同于护城河。",
      "以为长期持有就是长期不复盘。",
      "只研究公司优秀，不研究价格隐含的未来回报。"
    ],
    practiceActions: [
      "写出一家公司护城河的证据和反证。",
      "拆解管理层过去三年的资本配置：分红、回购、并购、扩产。",
      "用反向 DCF 看当前价格隐含了多高的长期增长。"
    ],
    relatedIds: ["person-charlie-munger", "concept-moat", "concept-good-company-good-price"],
    order: 4
  },
  {
    id: "timeline-fisher-growth",
    type: "timeline",
    title: "费雪与成长股思想",
    period: "1958",
    school: "成长价值",
    summary: "费雪强调优秀成长公司、管理层、研发能力、销售能力和长期持有。",
    coreIdeas: ["长期成长质量", "管理层访谈", "研发与销售能力", "飞轮式增长", "成长的证据链"],
    books: ["《怎样选择成长股》"],
    aShareNotes: [
      "适合研究制造业和医药创新，但需要警惕高增长叙事被资本开支和竞争摊薄。",
      "A 股成长公司要把成长来源拆开：行业空间、份额提升、产品结构、价格、并购和海外化。",
      "成长股研究要检查自由现金流、研发转化、客户集中度和产能利用率。"
    ],
    misunderstandings: [
      "把收入增长当成价值创造。",
      "把高研发投入等同于高研发产出。",
      "只听管理层故事，不做多方证据验证。"
    ],
    practiceActions: [
      "拆分一家成长公司的增长来源：量、价、份额、品类、并购。",
      "把增长假设写成三条可跟踪指标。",
      "列出成长故事失败时最先恶化的财务指标。"
    ],
    relatedIds: ["person-philip-fisher", "school-growth-value", "case-new-energy-manufacturing"],
    order: 5
  },
  {
    id: "timeline-peter-lynch",
    type: "timeline",
    title: "彼得·林奇与生活化选股",
    period: "1977-1990",
    school: "成长价值",
    summary: "林奇强调从生活和行业观察中发现公司，再用分类、增长、估值和资产负债表验证。",
    coreIdeas: ["从身边发现公司", "公司分类", "增长与估值匹配", "持续跟踪", "故事必须被数据验证"],
    books: ["《彼得·林奇的成功投资》"],
    aShareNotes: [
      "适合消费、家电和服务业研究，但生活体验必须转化为财务和竞争证据。",
      "A 股公司分类很重要：银行、白酒、煤炭、光伏、创新药不能用同一套增长故事解释。",
      "生活观察最好变成问题清单，而不是直接变成投资结论。"
    ],
    misunderstandings: [
      "把喜欢产品当成可以买公司。",
      "把热门门店、热搜和身边体验当成长期竞争优势。",
      "用 PEG 机械判断便宜，忽略周期和利润质量。"
    ],
    practiceActions: [
      "记录一次生活观察，并列出需要财报验证的指标。",
      "把一家公司先归类，再选择匹配的估值模板。",
      "写一段公司故事，并把每句话后面标注证据来源。"
    ],
    relatedIds: ["person-peter-lynch", "concept-pb-pe", "case-home-appliance"],
    order: 6
  },
  {
    id: "timeline-klarman-risk",
    type: "timeline",
    title: "塞思·卡拉曼与风险意识",
    period: "1991",
    school: "安全边际派",
    summary: "卡拉曼强调风险不是波动，而是永久损失；耐心、逆向和安全边际是应对不确定性的工具。",
    coreIdeas: ["永久损失风险", "安全边际", "逆向", "等待机会", "现金也是选择权"],
    books: ["《安全边际》"],
    aShareNotes: [
      "A 股波动大，安全边际需要同时覆盖估值误差、周期误判和流动性冲击。",
      "逆向机会要区分短期情绪冲击、周期底部和长期竞争力恶化。",
      "当资料不充分或价格不合适时，不操作本身就是风险管理。"
    ],
    misunderstandings: [
      "把安全边际当成固定折扣。",
      "把逆向等同于越跌越买。",
      "认为现金和等待没有投资价值。"
    ],
    practiceActions: [
      "给一项估值结论写出三个可能错的地方。",
      "为一次逆向想法写市场共识、你的不同判断和验证指标。",
      "写出不操作的条件：看不懂、价格不合适、证据不够、原则冲突。"
    ],
    relatedIds: ["person-seth-klarman", "concept-value-trap", "concept-do-nothing"],
    order: 7
  },
  {
    id: "timeline-li-lu-china",
    type: "timeline",
    title: "李录与中国价值投资实践",
    period: "1997-2020s",
    school: "中国价值投资",
    summary: "李录把格雷厄姆、巴菲特、芒格体系与中国企业、现代化进程和长期研究结合，强调能力圈、理性、诚实和长期复利。",
    coreIdeas: ["中国价值投资", "现代化视角", "能力圈", "长期主义", "理性与诚实"],
    books: ["《文明、现代化、价值投资与中国》", "《穷查理宝典》"],
    aShareNotes: [
      "适合理解中国企业研究不能只套海外模板，还要理解产业升级、制度环境、企业家精神和长期竞争格局。",
      "李录相关思想更强调把投资放在社会、产业和企业长期演化中观察，而不是只看短期财务比率。",
      "A 股实践中要把长期叙事转成可验证证据：行业空间、竞争优势、现金流、治理和估值。"
    ],
    misunderstandings: [
      "把长期主义理解成买了就不管。",
      "把中国机会理解成所有中国公司都有长期价值。",
      "用宏大叙事替代具体公司证据。"
    ],
    practiceActions: [
      "选一家 A 股公司，写出它所在行业和中国现代化进程的关系。",
      "用能力圈框架说明自己能理解哪些关键变量，哪些必须继续学习。",
      "把长期看好的理由拆成三条事实证据和三条反方问题。"
    ],
    relatedIds: ["person-li-lu", "book-civilization-value-investing", "school-china-value-practice"],
    order: 7.5
  },
  {
    id: "timeline-a-share-localization",
    type: "timeline",
    title: "A 股价值投资本土化",
    period: "2000s-至今",
    school: "本土化实践",
    summary: "A 股实践需要把经典体系和本土市场结构结合，重视政策周期、财报质量、行业分化和估值模板差异。",
    coreIdeas: ["行业差异化估值", "政策与周期", "财报披露节奏", "不操作纪律", "资料来源意识"],
    books: ["《巴菲特致股东的信》", "《聪明的投资者》", "《文明、现代化、价值投资与中国》"],
    aShareNotes: [
      "金融、周期、消费、制造业需要不同模板，不能用一个 PE 公式套所有公司。",
      "A 股研究要重视年报、公告、交易所问询、监管政策和行业公开数据的交叉验证。",
      "本土化不是降低标准，而是把经典原则翻译成适合 A 股行业结构和披露环境的检查清单。"
    ],
    misunderstandings: [
      "把海外成熟市场经验机械搬到 A 股。",
      "把政策周期当作不可研究的噪音。",
      "把 AI 或新闻摘要当成原始数据来源。"
    ],
    practiceActions: [
      "为一家公司选择估值模板，并说明为什么不用其他模板。",
      "为一条公司研究结论记录原始来源、数据日期和待确认点。",
      "把观察池公司分成金融、周期、消费、制造、研发驱动五类，并写出各自核心变量。"
    ],
    relatedIds: ["case-bank", "case-cyclical-coal", "case-baijiu-consumer", "person-li-lu"],
    order: 8
  },
  {
    id: "school-cigar-butt",
    type: "school",
    title: "烟蒂投资",
    period: "格雷厄姆体系",
    school: "烟蒂投资",
    summary: "寻找被市场抛弃但仍有剩余价值的公司，核心是价格极低和组合分散。",
    coreIdeas: ["净流动资产", "清算价值", "低估组合", "资产打折", "风险排雷"],
    books: ["《证券分析》"],
    aShareNotes: [
      "需要特别检查退市、诉讼、关联交易和资产减值。",
      "A 股烟蒂研究要把市值、净现金、可变现资产、债务和治理风险放在一起看。",
      "适合训练资产打折和组合思维，不适合新手孤注一掷押单家公司。"
    ],
    misunderstandings: [
      "把低价股当成烟蒂投资。",
      "只看净资产，不看资产变现难度。",
      "忽略等待时间和机会成本。"
    ],
    practiceActions: [
      "建立低估公司排雷清单。",
      "把一家破净公司的资产按现金、应收、存货、固定资产分别打折。",
      "写出价值释放路径和失败条件。"
    ],
    relatedIds: ["timeline-buffett-early", "concept-value-trap"],
    order: 9
  },
  {
    id: "school-deep-value",
    type: "school",
    title: "深度价值",
    period: "1930s-至今",
    school: "深度价值",
    summary: "以显著低于保守价值的价格买入，依靠均值回归、资产重估或经营改善。",
    coreIdeas: ["保守估值", "催化因素", "风险补偿", "均值回归", "价值释放路径"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "A 股深度价值必须识别价值释放路径，否则可能长期低估。",
      "要区分周期底部、经营改善、资产重估和纯粹衰退。",
      "深度价值研究要把低估理由和价值陷阱排查一起写。"
    ],
    misunderstandings: [
      "把估值低当成上涨理由。",
      "把均值回归当成必然发生。",
      "忽略低估背后的治理或商业模式缺陷。"
    ],
    practiceActions: [
      "写出价值释放的触发条件。",
      "列出市场为什么给低估值，以及这些理由是否正在变化。",
      "用悲观情景测试估值低是否仍能保护本金。"
    ],
    relatedIds: ["concept-intrinsic-value", "concept-margin-of-safety"],
    order: 10
  },
  {
    id: "school-growth-value",
    type: "school",
    title: "成长价值",
    period: "费雪与林奇",
    school: "成长价值",
    summary: "关注成长质量与估值匹配，避免为无法兑现的增长支付过高价格。",
    coreIdeas: ["成长来源", "增长质量", "估值匹配", "反向 DCF", "长期假设验证"],
    books: ["《怎样选择成长股》", "《彼得·林奇的成功投资》"],
    aShareNotes: [
      "制造业和医药成长需要关注竞争、资本开支和政策风险。",
      "A 股成长行业容易出现产能扩张和价格战，收入增长不一定带来股东回报。",
      "成长价值适合用反向 DCF 检查当前价格隐含了多乐观的未来。"
    ],
    misunderstandings: [
      "只看收入增速，不看自由现金流。",
      "把好赛道直接等同于好公司。",
      "用远期故事掩盖当下估值过高。"
    ],
    practiceActions: [
      "拆解增长假设并做反向 DCF。",
      "把增长拆成行业增长、份额提升、价格变化和利润率变化。",
      "每季度复盘成长假设是否被经营数据验证。"
    ],
    relatedIds: ["concept-reverse-dcf", "case-new-energy-manufacturing"],
    order: 11
  },
  {
    id: "school-quality-investing",
    type: "school",
    title: "质量投资",
    period: "巴菲特与芒格",
    school: "质量投资",
    summary: "以合理价格持有能长期创造高质量现金流的企业。",
    coreIdeas: ["高质量现金流", "高 ROE 可持续性", "优秀管理层", "资本配置", "合理价格"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "要区分商业模式质量、财务质量和估值质量。",
      "A 股高质量公司也会受到渠道、政策、需求周期和估值中枢变化影响。",
      "质量投资要同时检查护城河、现金流、管理层资本配置和估值隐含回报。"
    ],
    misunderstandings: [
      "好公司可以无视价格。",
      "高 ROE 一定可持续。",
      "长期持有等于不看估值和不复盘。"
    ],
    practiceActions: [
      "检查 ROE 来源：利润率、周转率、杠杆。",
      "用所有者收益而不是净利润粗略评估现金质量。",
      "记录管理层过去三年分红、回购、并购和扩产动作。"
    ],
    relatedIds: ["concept-roe", "concept-free-cash-flow"],
    order: 12
  },
  {
    id: "school-moat",
    type: "school",
    title: "护城河投资",
    period: "长期复利",
    school: "护城河投资",
    summary: "寻找能抵御竞争、维持超额收益的企业，并持续验证护城河是否变宽或变窄。",
    coreIdeas: ["品牌", "成本优势", "网络效应", "转换成本", "护城河变宽或变窄"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "A 股中行业政策、渠道变迁和技术替代会快速改变护城河。",
      "护城河要用数据验证：毛利率、份额、客户黏性、成本曲线、渠道结构和定价权。",
      "不同护城河有不同衰退信号，品牌看价格体系，成本看单位成本，网络效应看用户留存。"
    ],
    misunderstandings: [
      "把市场份额高等同于护城河。",
      "把历史品牌等同于未来定价权。",
      "只找证据不找反证。"
    ],
    practiceActions: [
      "为护城河列证据、反证和跟踪指标。",
      "写出竞争对手用什么方式可能削弱护城河。",
      "把护城河变化纳入年度复盘。"
    ],
    relatedIds: ["concept-moat", "case-baijiu-consumer"],
    order: 13
  },
  {
    id: "school-contrarian",
    type: "school",
    title: "逆向投资",
    period: "长期存在",
    school: "逆向投资",
    summary: "在市场共识悲观时寻找被错杀的机会，但必须区分短期情绪和长期恶化。",
    coreIdeas: ["反共识", "基本面验证", "耐心等待", "情绪与事实分离", "催化与时间"],
    books: ["《安全边际》"],
    aShareNotes: [
      "周期股逆向需要判断供需和利润中枢，不只是看股价跌幅。",
      "A 股热点切换快，逆向研究要避免把短期情绪错当长期机会。",
      "逆向必须写清楚市场共识、你的不同判断、验证指标和失败条件。"
    ],
    misunderstandings: [
      "为了逆向而逆向。",
      "看到跌幅大就认为有机会。",
      "忽略基本面长期恶化。"
    ],
    practiceActions: [
      "写出市场共识、你的不同判断和验证数据。",
      "给逆向想法设定三条证伪指标。",
      "区分短期估值修复、周期反转和长期价值重估。"
    ],
    relatedIds: ["case-cyclical-coal", "concept-do-nothing"],
    order: 14
  },
  {
    id: "school-margin-of-safety",
    type: "school",
    title: "安全边际派",
    period: "格雷厄姆至今",
    school: "安全边际派",
    summary: "承认估值会错，通过足够保守的价格和假设抵御不确定性。",
    coreIdeas: ["保守假设", "折价", "错误容忍度", "情景估值", "反方问题"],
    books: ["《安全边际》", "《聪明的投资者》"],
    aShareNotes: [
      "A 股安全边际还要覆盖流动性、财务质量和治理风险。",
      "安全边际应来自保守假设、估值区间、资产质量、现金流和价格纪律的组合。",
      "越依赖远期增长和政策环境，越需要更宽的情景区间。"
    ],
    misunderstandings: [
      "用固定百分比代替安全边际思考。",
      "只看价格折扣，不看假设是否乐观。",
      "把安全边际当成买入建议。"
    ],
    practiceActions: [
      "给估值结果写出安全边际来源。",
      "把估值参数改成悲观、中性、乐观三情景。",
      "请反方委员质疑估值里最乐观的三条假设。"
    ],
    relatedIds: ["concept-margin-of-safety", "concept-dcf"],
    order: 15
  },
  {
    id: "school-compounding",
    type: "school",
    title: "长期复利派",
    period: "芒格以后",
    school: "长期复利",
    summary: "把时间交给能持续再投资并产生高回报的企业，但前提是质量和价格都经过验证。",
    coreIdeas: ["长期持有", "再投资回报", "少做错误决策", "时间是筛选器", "复盘纪律"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "A 股长期持有更需要跟踪行业结构和公司治理变化。",
      "长期复利不是持有时间越长越好，而是企业能持续以高回报再投资。",
      "当行业格局、管理层、现金流或估值假设变化时，长期持有也需要重新审视。"
    ],
    misunderstandings: [
      "把长期持有变成不复盘。",
      "把一次成功公司经验套到所有公司。",
      "忽略估值过高会降低长期回报。"
    ],
    practiceActions: [
      "建立年度复盘问题清单。",
      "记录企业再投资回报是否仍然高于资本成本。",
      "写下会让你停止长期持有的事实变化。"
    ],
    relatedIds: ["concept-owner-earnings", "concept-good-company-good-price"],
    order: 16
  },
  {
    id: "school-china-value-practice",
    type: "school",
    title: "中国价值投资实践",
    period: "李录与本土化",
    school: "中国价值投资",
    summary: "把经典价值投资原则放入中国现代化、产业升级和 A 股披露环境中，强调长期研究、能力圈和事实证据。",
    coreIdeas: ["中国价值投资", "现代化视角", "长期主义", "资料来源意识", "反方验证"],
    books: ["《文明、现代化、价值投资与中国》", "《巴菲特致股东的信》"],
    aShareNotes: [
      "适合训练从中国行业结构和产业升级中理解公司，但不能用宏大叙事替代公司证据。",
      "A 股研究要把长期判断落到公开披露、财务质量、竞争格局和估值区间。",
      "中国本土化实践要求更强的政策、周期、治理和信息来源意识。"
    ],
    misunderstandings: [
      "把中国长期机会等同于所有中国公司都值得投资。",
      "把长期主义理解成忽略估值和风险。",
      "把新闻热度当成产业趋势证据。"
    ],
    practiceActions: [
      "为一个行业写出中国现代化驱动、商业模式受益路径和反方风险。",
      "为一家 A 股公司列出年报、公告、行业数据和第三方资料来源。",
      "把长期叙事拆成三年内可观察的关键指标。"
    ],
    relatedIds: ["timeline-li-lu-china", "person-li-lu", "timeline-a-share-localization"],
    order: 16.5
  },
  {
    id: "person-benjamin-graham",
    type: "person",
    title: "本杰明·格雷厄姆",
    period: "1894-1976",
    school: "深度价值",
    summary: "价值投资体系奠基人，强调安全边际、市场先生和防御型投资。",
    coreIdeas: ["市场先生", "安全边际", "证券分析", "防御型投资者"],
    books: ["《证券分析》", "《聪明的投资者》"],
    aShareNotes: [
      "适合训练保守、纪律和报表底线思维。",
      "在 A 股研究中，格雷厄姆更像一套排雷和定价纪律，而不是简单低估筛选器。"
    ],
    misunderstandings: ["只学低估，不学风险控制。", "把格雷厄姆方法简化成买低 PE 或低 PB。"],
    practiceActions: ["用市场先生框架写一段价格波动解释。", "为一家低估公司写出安全边际来自哪里。"],
    relatedIds: ["concept-market-mr", "book-intelligent-investor"],
    order: 17
  },
  {
    id: "person-david-dodd",
    type: "person",
    title: "戴维·多德",
    period: "1895-1988",
    school: "证券分析",
    summary: "与格雷厄姆共同系统化证券分析方法，强调严谨、证据和保守估值。",
    coreIdeas: ["证据链", "保守估值", "报表分析", "事实与推断分离"],
    books: ["《证券分析》"],
    aShareNotes: [
      "提醒 A 股研究必须回到披露文件和财务证据。",
      "适合训练研究笔记结构：资料来源、事实、推断、风险和待确认。"
    ],
    misunderstandings: ["把故事当分析。", "只看摘要，不追溯公告和年报原文。"],
    practiceActions: ["把一条投资观点拆成事实、推断和观点。", "为一家公司建立资料来源清单。"],
    relatedIds: ["book-security-analysis", "timeline-security-analysis"],
    order: 18
  },
  {
    id: "person-warren-buffett",
    type: "person",
    title: "沃伦·巴菲特",
    period: "1930-",
    school: "质量投资",
    summary: "从深度价值走向质量投资，强调能力圈、护城河、现金流和长期复利。",
    coreIdeas: ["能力圈", "护城河", "所有者收益", "好公司合理价格", "资本配置"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "适合建立企业所有者视角，而不是短期价格预测视角。",
      "A 股应用巴菲特体系时，要同时检查管理层资本配置、治理结构和现金流质量。"
    ],
    misunderstandings: ["只记名言，不做估值和反证。", "用巴菲特名义包装长期持有，但不做复盘。"],
    practiceActions: ["写出一家公司的能力圈边界。", "把一家公司的净利润调整成所有者收益估算。"],
    relatedIds: ["concept-circle-of-competence", "concept-owner-earnings"],
    order: 19
  },
  {
    id: "person-charlie-munger",
    type: "person",
    title: "查理·芒格",
    period: "1924-2023",
    school: "长期复利",
    summary: "推动巴菲特重视优秀企业和多元思维模型，强调避免愚蠢错误。",
    coreIdeas: ["好生意", "多元思维模型", "反向思考", "避免愚蠢错误"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "适合建立跨行业判断和反方清单。",
      "A 股行业变化快，芒格式反向思考适合用来识别政策、周期、技术和治理风险。"
    ],
    misunderstandings: ["把好公司口号化。", "把多元思维模型变成名词堆砌。"],
    practiceActions: ["用反向思考列出会让投资失败的条件。", "给投资想法写一份反方委员问题清单。"],
    relatedIds: ["timeline-buffett-munger", "school-compounding"],
    order: 20
  },
  {
    id: "person-philip-fisher",
    type: "person",
    title: "菲利普·费雪",
    period: "1907-2004",
    school: "成长价值",
    summary: "成长股投资代表人物，重视管理层、研发、销售和长期增长质量。",
    coreIdeas: ["闲聊法", "成长质量", "长期持有", "管理层质量"],
    books: ["《怎样选择成长股》"],
    aShareNotes: [
      "适合研究制造业和科技产业链，但要警惕竞争恶化。",
      "A 股普通用户可用年报、客户结构、供应链和行业数据替代直接访谈。"
    ],
    misunderstandings: ["只看赛道，不看公司能力。", "把调研理解成听管理层故事。"],
    practiceActions: ["为一家成长公司列出十个调研问题。", "把成长假设拆成可验证指标。"],
    relatedIds: ["book-common-stocks", "school-growth-value"],
    order: 21
  },
  {
    id: "person-peter-lynch",
    type: "person",
    title: "彼得·林奇",
    period: "1944-",
    school: "成长价值",
    summary: "强调普通人也能从生活中发现机会，但必须用公司分类和财务数据验证。",
    coreIdeas: ["生活观察", "公司分类", "PEG", "故事与数据"],
    books: ["《彼得·林奇的成功投资》"],
    aShareNotes: [
      "适合消费股观察，但体验不能替代财务验证。",
      "A 股公司分类能帮助用户选择估值模板，避免所有公司都用 PE 粗暴比较。"
    ],
    misunderstandings: ["喜欢产品等于看懂公司。", "把 PEG 当成万能公式。"],
    practiceActions: ["把公司归类为缓慢增长、稳定增长、快速增长、周期等。", "把生活观察转成三条财务验证问题。"],
    relatedIds: ["timeline-peter-lynch", "case-home-appliance"],
    order: 22
  },
  {
    id: "person-seth-klarman",
    type: "person",
    title: "塞思·卡拉曼",
    period: "1957-",
    school: "安全边际派",
    summary: "强调风险控制、耐心和安全边际，反对用短期波动代替风险思考。",
    coreIdeas: ["永久损失", "耐心", "保守假设", "逆向纪律"],
    books: ["《安全边际》"],
    aShareNotes: [
      "适合约束 A 股追涨和情绪化交易。",
      "在 A 股高波动环境里，卡拉曼框架能帮助用户区分波动、风险和永久损失。"
    ],
    misunderstandings: ["把低波动当低风险。", "把逆向当成情绪姿态。"],
    practiceActions: ["为一家公司写永久损失风险清单。", "写出你为什么可以等待而不是立刻行动。"],
    relatedIds: ["timeline-klarman-risk", "concept-margin-of-safety"],
    order: 23
  },
  {
    id: "person-john-neff",
    type: "person",
    title: "约翰·聂夫",
    period: "1931-2019",
    school: "低估成长",
    summary: "偏好低估值、稳健增长和高股息，强调朴素但严格的估值纪律。",
    coreIdeas: ["低 PE", "稳健增长", "股息回报", "朴素纪律"],
    books: ["《约翰·聂夫谈投资》"],
    aShareNotes: [
      "适合理解低估蓝筹和股息资产，但需看分红可持续性。",
      "A 股高股息资产要检查利润中枢、现金流和资本开支，而不是只看静态股息率。"
    ],
    misunderstandings: ["把低 PE 当安全。", "把高股息当成无风险收益。"],
    practiceActions: ["比较股息率、利润稳定性和资本开支需求。", "用三情景测试分红能否持续。"],
    relatedIds: ["concept-pb-pe", "case-bank"],
    order: 24
  },
  {
    id: "person-li-lu",
    type: "person",
    title: "李录",
    period: "1966-",
    school: "中国价值投资",
    summary: "喜马拉雅资本创始人，受芒格等影响，坚持价值投资和长期主义，强调理性、诚实、能力圈和对中国现代化进程的理解。",
    coreIdeas: ["中国价值投资", "现代化视角", "能力圈", "长期主义", "理性与诚实"],
    books: ["《文明、现代化、价值投资与中国》", "《穷查理宝典》"],
    aShareNotes: [
      "适合把经典价值投资方法和中国企业实践连接起来。",
      "研究 A 股时，可以借用李录框架：先理解长期产业趋势，再回到具体公司证据和估值纪律。",
      "长期主义必须落实到能力圈、事实证据和风险清单，不能变成宏大叙事。"
    ],
    misunderstandings: [
      "把长期看好中国等同于看好所有 A 股公司。",
      "把李录思想简化成只买长期成长公司。",
      "忽略理性和诚实首先要求承认自己不知道。"
    ],
    practiceActions: [
      "写出一家公司与中国现代化进程的关系，但同时列出反方证据。",
      "用能力圈判断自己是否真正理解这家公司。",
      "把长期持有理由转化为年度复盘指标。"
    ],
    relatedIds: ["timeline-li-lu-china", "school-china-value-practice", "book-civilization-value-investing"],
    order: 24.5
  },
  {
    id: "book-security-analysis",
    type: "book",
    title: "《证券分析》",
    period: "1934",
    school: "证券分析",
    summary: "价值投资经典源头，适合学习报表、债券、股票和安全边际的系统分析方法。",
    coreIdeas: ["严谨证据", "资产价值", "盈利能力", "安全边际", "证券选择先排雷"],
    books: ["《证券分析》"],
    aShareNotes: [
      "适合作为财报和估值底层训练，不适合直接照搬历史筛选法。",
      "A 股应用时要特别看资产真实性、负债期限、现金流和治理风险。",
      "这本书更像研究方法手册，不是快速选股公式。"
    ],
    misunderstandings: ["以为读完就能机械选股。", "只学低估资产，不学风险排除和证据链。"],
    practiceActions: ["选择一个章节方法，应用到一家 A 股公司的年报。", "把资产、盈利、债务和安全边际写成四栏研究笔记。"],
    relatedIds: ["timeline-security-analysis", "person-david-dodd"],
    order: 25
  },
  {
    id: "book-intelligent-investor",
    type: "book",
    title: "《聪明的投资者》",
    period: "1949",
    school: "防御型投资",
    summary: "面向普通投资者的价值投资入门经典，核心是市场先生、防御心态和安全边际。",
    coreIdeas: ["防御型投资者", "市场先生", "安全边际", "情绪纪律"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "适合建立不追涨、不预测市场、重视纪律的基础。",
      "A 股波动和热点多，这本书适合作为投资行为约束的第一课。",
      "读完应形成自己的市场波动处理规则，而不是寻找下一个热点。"
    ],
    misunderstandings: ["把防御等同于保守到不学习。", "把市场先生理解成每次下跌都是机会。"],
    practiceActions: ["写下你的防御型投资原则草案。", "为市场大跌时的自己写一张行动前检查清单。"],
    relatedIds: ["person-benjamin-graham", "concept-market-mr"],
    order: 26
  },
  {
    id: "book-shareholder-letters",
    type: "book",
    title: "《巴菲特致股东的信》",
    period: "1977-至今",
    school: "质量投资",
    summary: "理解企业所有者思维、资本配置、保险浮存金、护城河和长期复利的重要材料。",
    coreIdeas: ["所有者收益", "资本配置", "护城河", "长期复利", "能力圈"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: [
      "适合训练从企业经营而非股价涨跌看公司。",
      "A 股公司研究可借鉴股东信框架：商业模式、现金流、资本配置、管理层和估值。",
      "读股东信要转成自己的检查清单，而不是收藏金句。"
    ],
    misunderstandings: ["只摘录金句，不写投资原则。", "只学长期持有，不学能力圈和价格纪律。"],
    practiceActions: ["把一封股东信转化为一条自己的投资原则。", "为观察池公司写所有者收益和资本配置记录。"],
    relatedIds: ["person-warren-buffett", "concept-owner-earnings"],
    order: 27
  },
  {
    id: "book-common-stocks",
    type: "book",
    title: "《怎样选择成长股》",
    period: "1958",
    school: "成长价值",
    summary: "费雪代表作，强调优秀成长公司、调研问题、管理层和长期竞争力。",
    coreIdeas: ["十五点原则", "闲聊法", "成长质量", "管理层质量"],
    books: ["《怎样选择成长股》"],
    aShareNotes: [
      "适合制造业和医药研究，但要结合公开披露而非传闻。",
      "A 股普通用户可以用年报、招股书、客户供应商、行业数据和公告替代直接访谈。",
      "成长股研究要同时检查增长、利润率、资本开支和现金流。"
    ],
    misunderstandings: ["把调研当听故事。", "把高增长赛道当成公司质量证明。"],
    practiceActions: ["为一家公司写十五点检查草稿。", "把公开资料拆成客户、产品、研发、销售和管理层五类证据。"],
    relatedIds: ["person-philip-fisher", "school-growth-value"],
    order: 28
  },
  {
    id: "book-one-up",
    type: "book",
    title: "《彼得·林奇的成功投资》",
    period: "1989",
    school: "生活化研究",
    summary: "普通投资者入门友好，强调从生活观察出发，再回到分类、增长和估值验证。",
    coreIdeas: ["生活观察", "公司分类", "PEG", "持续跟踪"],
    books: ["《彼得·林奇的成功投资》"],
    aShareNotes: [
      "适合消费和服务公司入门，但必须避免主观喜好偏差。",
      "A 股应用时要先分类：稳定增长、快速增长、周期、困境反转、资产型，问题完全不同。",
      "生活观察要回到收入、利润率、现金流、开店效率、库存和估值。"
    ],
    misunderstandings: ["只靠体验，不看财报。", "用身边样本代替全市场数据。"],
    practiceActions: ["把一个消费品牌观察转化为研究问题。", "为一家公司写一句投资故事，并标注每个判断的证据。"],
    relatedIds: ["person-peter-lynch", "case-baijiu-consumer"],
    order: 29
  },
  {
    id: "book-margin-of-safety",
    type: "book",
    title: "《安全边际》",
    period: "1991",
    school: "安全边际派",
    summary: "卡拉曼代表作，强调风险、耐心、逆向和避免永久损失。",
    coreIdeas: ["风险控制", "安全边际", "耐心", "逆向", "避免永久损失"],
    books: ["《安全边际》"],
    aShareNotes: [
      "适合约束热门主题追逐和估值乐观假设。",
      "A 股高波动环境下，卡拉曼框架能帮助用户把风险从股价波动转回永久损失。",
      "逆向和耐心需要事实支撑，不是情绪姿态。"
    ],
    misunderstandings: ["把安全边际当成口号。", "把下跌当成天然安全边际。"],
    practiceActions: ["为一次投资想法写反方质询。", "写出估值中最可能错的三条假设。"],
    relatedIds: ["person-seth-klarman", "school-margin-of-safety"],
    order: 30
  },
  {
    id: "book-civilization-value-investing",
    type: "book",
    title: "《文明、现代化、价值投资与中国》",
    period: "2020",
    school: "中国价值投资",
    summary: "李录相关文集，适合理解价值投资、现代化进程、中国企业长期机会和投资人自我修炼之间的关系。",
    coreIdeas: ["现代化视角", "中国价值投资", "长期主义", "理性与诚实", "能力圈"],
    books: ["《文明、现代化、价值投资与中国》"],
    aShareNotes: [
      "适合把中国企业研究放进更长周期的产业与社会演化中理解。",
      "A 股应用时，必须把长期叙事转成公司层面的证据、估值假设和风险清单。",
      "这本书更适合建立世界观和研究框架，不适合作为任何个股结论。"
    ],
    misunderstandings: [
      "把宏观叙事当成公司价值证明。",
      "把长期主义当成不看价格和不复盘。",
      "把中国价值投资理解成只投资中国公司。"
    ],
    practiceActions: [
      "为一个行业写出长期现代化逻辑、公司受益路径和反方风险。",
      "把一个长期判断拆成三条可验证事实。",
      "写出自己在该行业的能力圈边界。"
    ],
    relatedIds: ["person-li-lu", "timeline-li-lu-china", "school-china-value-practice"],
    order: 30.5
  },
  {
    id: "concept-margin-of-safety",
    type: "concept",
    title: "安全边际",
    period: "核心概念",
    school: "安全边际派",
    summary: "安全边际是为估值错误和不确定性预留空间，不是简单打折。",
    coreIdeas: ["保守估值", "错误容忍", "价格低于价值"],
    books: ["《聪明的投资者》", "《安全边际》"],
    aShareNotes: ["A 股中要同时考虑财务质量、周期和流动性冲击。"],
    misunderstandings: ["固定打七折就是安全边际。"],
    practiceActions: ["写出你的估值可能错在哪里。"],
    relatedIds: ["school-margin-of-safety", "timeline-klarman-risk"],
    order: 31
  },
  {
    id: "concept-market-mr",
    type: "concept",
    title: "市场先生",
    period: "核心概念",
    school: "格雷厄姆体系",
    summary: "市场每天报价，但你不必每天行动；价格波动是可利用的报价，不是命令。",
    coreIdeas: ["市场情绪", "报价而非指令", "独立判断"],
    books: ["《聪明的投资者》"],
    aShareNotes: ["A 股波动大，更需要把价格和价值分开。"],
    misunderstandings: ["把市场波动当作基本面变化。"],
    practiceActions: ["记录一次价格大跌时的事实和情绪。"],
    relatedIds: ["person-benjamin-graham", "concept-do-nothing"],
    order: 32
  },
  {
    id: "concept-circle-of-competence",
    type: "concept",
    title: "能力圈",
    period: "核心概念",
    school: "巴菲特体系",
    summary: "能力圈不是你懂多少，而是你清楚知道哪些东西自己不懂。",
    coreIdeas: ["边界意识", "可解释", "可跟踪"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["跨行业投资前先判断自己是否能理解商业模式和关键变量。"],
    misunderstandings: ["把听过行业名当作进入能力圈。"],
    practiceActions: ["为一家公司写能力圈内/外理由。"],
    relatedIds: ["person-warren-buffett", "concept-do-nothing"],
    order: 33
  },
  {
    id: "concept-moat",
    type: "concept",
    title: "护城河",
    period: "核心概念",
    school: "质量投资",
    summary: "护城河是企业抵御竞争、维持超额回报的结构性优势。",
    coreIdeas: ["品牌", "成本", "网络效应", "转换成本"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["要用数据证明护城河，而不是只看行业地位。"],
    misunderstandings: ["龙头一定有护城河。"],
    practiceActions: ["列出护城河证据和正在削弱它的因素。"],
    relatedIds: ["school-moat", "case-baijiu-consumer"],
    order: 34
  },
  {
    id: "concept-owner-earnings",
    type: "concept",
    title: "所有者收益",
    period: "估值概念",
    school: "巴菲特体系",
    summary: "所有者收益关注企业真正能分配给股东的现金，而不只是会计利润。",
    coreIdeas: ["净利润", "折旧摊销", "维护性资本开支", "现金流"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["重资产制造业需要区分维护性和扩张性资本开支。"],
    misunderstandings: ["净利润等于可分配现金。"],
    practiceActions: ["比较净利润和经营现金流差异。"],
    relatedIds: ["concept-free-cash-flow", "case-home-appliance"],
    order: 35
  },
  {
    id: "concept-free-cash-flow",
    type: "concept",
    title: "自由现金流",
    period: "估值概念",
    school: "质量投资",
    summary: "自由现金流衡量企业经营后扣除必要资本开支还能留下多少现金。",
    coreIdeas: ["经营现金流", "资本开支", "现金创造"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["高增长公司可能利润好看但自由现金流长期为负。"],
    misunderstandings: ["只看利润表，不看现金流量表。"],
    practiceActions: ["计算三年自由现金流趋势。"],
    relatedIds: ["concept-owner-earnings", "concept-dcf"],
    order: 36
  },
  {
    id: "concept-intrinsic-value",
    type: "concept",
    title: "内在价值",
    period: "估值概念",
    school: "价值投资",
    summary: "内在价值是企业未来能创造现金流的折现估计，不是一个精确数字。",
    coreIdeas: ["未来现金流", "折现", "区间估值"],
    books: ["《证券分析》", "《巴菲特致股东的信》"],
    aShareNotes: ["A 股估值应输出区间和假设，而不是单一目标价。"],
    misunderstandings: ["估值模型算出一个准确价格。"],
    practiceActions: ["写出估值区间的三项关键假设。"],
    relatedIds: ["concept-dcf", "concept-reverse-dcf"],
    order: 37
  },
  {
    id: "concept-value-trap",
    type: "concept",
    title: "价值陷阱",
    period: "风险概念",
    school: "深度价值",
    summary: "看起来便宜但价值持续下降的公司，低估值可能是风险信号而不是机会。",
    coreIdeas: ["利润下滑", "资产减值", "治理风险", "行业衰退"],
    books: ["《安全边际》"],
    aShareNotes: ["A 股中要特别关注退市、商誉、应收和关联交易。"],
    misunderstandings: ["跌多了自然会涨。"],
    practiceActions: ["给低估公司做价值陷阱排查。"],
    relatedIds: ["school-cigar-butt", "concept-pb-pe"],
    order: 38
  },
  {
    id: "concept-good-company-good-price",
    type: "concept",
    title: "好公司与好价格",
    period: "核心概念",
    school: "质量投资",
    summary: "好公司需要好价格，价格决定未来回报率和安全边际。",
    coreIdeas: ["质量", "估值", "预期收益率"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["热门白马股也会因为估值过高造成长期收益不佳。"],
    misunderstandings: ["好公司任何时候都值得买。"],
    practiceActions: ["比较不同买入价格下的隐含收益率。"],
    relatedIds: ["school-quality-investing", "concept-reverse-dcf"],
    order: 39
  },
  {
    id: "concept-roe",
    type: "concept",
    title: "ROE",
    period: "财务概念",
    school: "质量投资",
    summary: "ROE 衡量股东权益回报，但必须拆解利润率、周转率和杠杆来源。",
    coreIdeas: ["杜邦分析", "可持续性", "杠杆风险"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["银行、消费和制造业的 ROE 含义不同，不能直接横向比较。"],
    misunderstandings: ["高 ROE 一定是好公司。"],
    practiceActions: ["做一个简单杜邦拆解。"],
    relatedIds: ["case-bank", "case-baijiu-consumer"],
    order: 40
  },
  {
    id: "concept-pb-pe",
    type: "concept",
    title: "PB 与 PE",
    period: "估值概念",
    school: "估值工具",
    summary: "PB 更适合资产和资本约束型公司，PE 更适合盈利相对稳定的公司。",
    coreIdeas: ["账面价值", "盈利倍数", "行业适配"],
    books: ["《证券分析》"],
    aShareNotes: ["银行看 PB-ROE，周期股看中枢利润，消费制造看盈利质量。"],
    misunderstandings: ["所有公司都用 PE 比较。"],
    practiceActions: ["判断一家公司更适合 PB、PE 还是 DCF。"],
    relatedIds: ["case-bank", "case-cyclical-coal"],
    order: 41
  },
  {
    id: "concept-dcf",
    type: "concept",
    title: "DCF",
    period: "估值工具",
    school: "估值工具",
    summary: "DCF 用未来现金流折现估计价值，适合现金流可预测的公司。",
    coreIdeas: ["自由现金流", "折现率", "永续增长", "敏感性"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["DCF 对长期假设极敏感，适合输出区间而不是精确价。"],
    misunderstandings: ["参数越复杂越专业。"],
    practiceActions: ["列出 DCF 最敏感的三个参数。"],
    relatedIds: ["concept-free-cash-flow", "concept-intrinsic-value"],
    order: 42
  },
  {
    id: "concept-reverse-dcf",
    type: "concept",
    title: "反向 DCF",
    period: "估值工具",
    school: "估值工具",
    summary: "反向 DCF 从当前价格倒推出市场隐含增长，检验预期是否合理。",
    coreIdeas: ["隐含假设", "预期验证", "反方质询"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["适合高估值成长股和热门赛道，帮助识别过度乐观。"],
    misunderstandings: ["只要公司好，隐含增长就能兑现。"],
    practiceActions: ["倒推当前市值要求的利润增长。"],
    relatedIds: ["concept-good-company-good-price", "case-new-energy-manufacturing"],
    order: 43
  },
  {
    id: "concept-do-nothing",
    type: "concept",
    title: "不操作也是决策",
    period: "投资纪律",
    school: "长期复利",
    summary: "没有足够理解、价格或安全边际时，不操作是主动纪律，不是错过机会。",
    coreIdeas: ["等待", "机会成本", "纪律", "减少错误"],
    books: ["《安全边际》", "《聪明的投资者》"],
    aShareNotes: ["A 股热点多，明确不操作条件能减少追涨和频繁交易。"],
    misunderstandings: ["不操作等于没有决策。"],
    practiceActions: ["写一张不操作检查清单。"],
    relatedIds: ["concept-market-mr", "concept-circle-of-competence"],
    order: 44
  },
  {
    id: "concept-pe",
    type: "concept",
    title: "PE 市盈率",
    period: "估值与市场指标",
    school: "指标辅助工具",
    summary: "PE 是市值与利润的比例，用来观察价格相对盈利是否昂贵，但必须结合行业、周期、利润质量和增长判断。",
    coreIdeas: ["市盈率", "盈利倍数", "利润质量", "估值陷阱"],
    books: ["《证券分析》", "《聪明的投资者》"],
    aShareNotes: [
      "A 股中 PE 适合盈利相对稳定的消费、成熟制造等公司，不适合直接套用到强周期和金融股。",
      "低 PE 可能是便宜，也可能是周期顶部利润、一次性收益或市场预期利润下滑。",
      "高 PE 可能代表成长预期，也可能代表过度乐观，必须用反向 DCF 或利润情景验证。"
    ],
    misunderstandings: [
      "PE 越低越安全。",
      "所有行业都可以用 PE 横向比较。",
      "只看静态 PE，不看利润是否可持续。"
    ],
    practiceActions: [
      "用过去三年净利润和扣非净利润比较静态 PE 的可靠性。",
      "判断公司属于稳定盈利、周期盈利还是成长投入阶段。",
      "把 PE 拆成价格、利润、增长和风险四个问题。"
    ],
    relatedIds: ["concept-pb-pe", "concept-good-company-good-price", "concept-value-trap"],
    order: 44.1
  },
  {
    id: "concept-peg",
    type: "concept",
    title: "PEG",
    period: "估值与市场指标",
    school: "指标辅助工具",
    summary: "PEG 用 PE 除以盈利增长率，尝试把估值和成长速度放在一起看，但对增长可持续性非常敏感。",
    coreIdeas: ["PEG", "成长匹配", "增长质量", "预期验证"],
    books: ["《彼得·林奇的成功投资》", "《怎样选择成长股》"],
    aShareNotes: [
      "PEG 适合粗看成长股估值和增长是否匹配，但不能替代现金流、竞争格局和资本开支分析。",
      "A 股热门赛道增长率波动大，单年高增长会让 PEG 看起来便宜。",
      "PEG 应使用可持续增长率，而不是只使用下一年预测增速。"
    ],
    misunderstandings: [
      "PEG 小于 1 就一定便宜。",
      "把一次性高增长当作长期增长。",
      "忽略增长背后的毛利率、费用率和自由现金流。"
    ],
    practiceActions: [
      "分别用过去三年复合增速和未来三年保守增速计算 PEG。",
      "列出增长率下降一半时估值是否仍可接受。",
      "把 PEG 结论和反向 DCF 隐含增长做交叉验证。"
    ],
    relatedIds: ["person-peter-lynch", "school-growth-value", "concept-reverse-dcf"],
    order: 44.2
  },
  {
    id: "concept-moving-average",
    type: "concept",
    title: "均线",
    period: "技术面指标",
    school: "指标辅助工具",
    summary: "均线把一段时间的价格平均化，用来观察趋势和市场成本区间，但它反映的是价格历史，不代表企业价值。",
    coreIdeas: ["移动平均线", "趋势过滤", "市场成本", "滞后指标"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "均线可帮助观察市场情绪和趋势强弱，但不能判断公司是否低估。",
      "价值投资中可以用均线提醒自己价格处在什么市场状态，再回到估值和基本面做判断。",
      "A 股波动较大，均线突破和跌破容易产生噪音，不能单独作为交易规则。"
    ],
    misunderstandings: [
      "站上均线就代表可以买。",
      "跌破均线就代表公司价值变坏。",
      "把短期趋势当成长期投资结论。"
    ],
    practiceActions: [
      "观察 20 日、60 日、250 日均线分别反映短期、中期、长期价格状态。",
      "把均线变化和公司基本面事件分开记录。",
      "当价格大幅偏离长期均线时，回到估值区间检查情绪是否过热或过冷。"
    ],
    relatedIds: ["concept-market-mr", "concept-do-nothing", "concept-intrinsic-value"],
    order: 44.3
  },
  {
    id: "concept-boll",
    type: "concept",
    title: "BOLL 布林线",
    period: "技术面指标",
    school: "指标辅助工具",
    summary: "BOLL 用均线和标准差形成价格通道，帮助观察波动区间和情绪极端，但不说明内在价值。",
    coreIdeas: ["布林线", "波动区间", "标准差", "情绪极端"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "BOLL 可作为观察价格波动是否偏离近期常态的工具，但不能替代安全边际计算。",
      "A 股急涨急跌时，突破上轨或下轨可能只是情绪和流动性变化。",
      "价值投资者使用 BOLL 时，应把它当作提醒：现在市场情绪是否需要更谨慎。"
    ],
    misunderstandings: [
      "触及下轨就一定反弹。",
      "突破上轨就一定继续上涨。",
      "把波动区间当成价值区间。"
    ],
    practiceActions: [
      "记录价格触及 BOLL 上下轨时，公司基本面是否发生变化。",
      "把 BOLL 信号和估值区间、安全边际一起看。",
      "用 BOLL 观察情绪，不用它替代最终判断。"
    ],
    relatedIds: ["concept-market-mr", "concept-margin-of-safety", "concept-do-nothing"],
    order: 44.4
  },
  {
    id: "concept-rsi",
    type: "concept",
    title: "RSI",
    period: "技术面指标",
    school: "指标辅助工具",
    summary: "RSI 衡量一段时间内上涨和下跌力量的相对强弱，常被用来观察超买或超卖状态。",
    coreIdeas: ["RSI", "相对强弱", "超买超卖", "情绪温度计"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "RSI 可以作为情绪温度计，提醒价格短期是否过热或过冷。",
      "对价值投资来说，RSI 不能回答公司值多少钱，只能辅助观察市场情绪。",
      "A 股题材行情中 RSI 可能长期高位或低位，不能机械使用阈值。"
    ],
    misunderstandings: [
      "RSI 低就一定可以买。",
      "RSI 高就一定要卖。",
      "把情绪指标当作估值指标。"
    ],
    practiceActions: [
      "当 RSI 极端时，写下市场情绪和基本面事实分别是什么。",
      "把 RSI 与估值区间、风险清单结合，而不是单独行动。",
      "观察 RSI 背离时，检查是否有基本面变化支撑。"
    ],
    relatedIds: ["concept-market-mr", "concept-do-nothing", "concept-good-company-good-price"],
    order: 44.5
  },
  {
    id: "concept-macd",
    type: "concept",
    title: "MACD",
    period: "技术面指标",
    school: "指标辅助工具",
    summary: "MACD 用快慢均线差观察趋势动能变化，适合看市场动量，但它仍然是价格历史的加工结果。",
    coreIdeas: ["MACD", "趋势动能", "快慢均线", "背离"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "MACD 可以帮助观察价格趋势是否增强或减弱，但不能证明公司价值变化。",
      "价值投资者更适合把 MACD 当作市场先生情绪变化的记录工具。",
      "A 股震荡市里 MACD 容易频繁给出噪音，必须避免信号交易化。"
    ],
    misunderstandings: [
      "金叉就是买入信号。",
      "死叉就是卖出信号。",
      "指标背离一定会马上反转。"
    ],
    practiceActions: [
      "看到金叉或死叉时，先问公司基本面和估值是否变化。",
      "把 MACD 背离记录为观察项，而不是决策结论。",
      "用复盘检查技术信号是否曾让自己偏离投资原则。"
    ],
    relatedIds: ["concept-market-mr", "concept-do-nothing", "concept-margin-of-safety"],
    order: 44.6
  },
  {
    id: "concept-kdj",
    type: "concept",
    title: "KDJ",
    period: "技术面指标",
    school: "指标辅助工具",
    summary: "KDJ 用最高价、最低价和收盘价关系观察短期价格位置，常用于识别短线强弱和情绪波动。",
    coreIdeas: ["KDJ", "随机指标", "短期强弱", "钝化"],
    books: ["《聪明的投资者》"],
    aShareNotes: [
      "KDJ 对短期波动敏感，适合观察市场情绪，不适合作为价值投资核心判断。",
      "A 股强趋势行情中 KDJ 可能钝化，短线信号容易误导长期研究。",
      "使用 KDJ 时要明确：它只能回答短期价格位置，不能回答企业长期价值。"
    ],
    misunderstandings: [
      "KDJ 低位就一定有安全边际。",
      "KDJ 高位就代表公司不值得持有。",
      "用短期指标替代长期研究。"
    ],
    practiceActions: [
      "把 KDJ 信号和自己的投资周期写清楚，避免短线指标干扰长期判断。",
      "当 KDJ 极端时，检查估值、现金流和风险清单是否支持行动。",
      "复盘一次自己被短期指标影响的决策。"
    ],
    relatedIds: ["concept-market-mr", "concept-do-nothing", "concept-circle-of-competence"],
    order: 44.7
  },
  {
    id: "case-baijiu-consumer",
    type: "case",
    title: "白酒消费公司案例",
    period: "A 股案例",
    school: "消费股",
    summary: "用于理解品牌、渠道、提价能力、高 ROE 和估值溢价的边界。",
    coreIdeas: ["品牌", "渠道", "提价能力", "高 ROE"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["可观察贵州茅台、五粮液等公开资料中的品牌和渠道特征。", ...sharedBoundary],
    misunderstandings: ["品牌强就能无视价格。"],
    practiceActions: ["比较收入增长、毛利率、渠道库存和现金流。"],
    relatedIds: ["concept-moat", "concept-good-company-good-price", "case-moutai-600519"],
    order: 45
  },
  {
    id: "case-bank",
    type: "case",
    title: "银行案例",
    period: "A 股案例",
    school: "金融股",
    summary: "用于理解 PB、ROE、不良率、拨备覆盖率和资产质量。",
    coreIdeas: ["PB-ROE", "不良率", "拨备", "息差"],
    books: ["《证券分析》"],
    aShareNotes: ["可观察招商银行、工商银行等公开披露差异。", ...sharedBoundary],
    misunderstandings: ["银行破净就一定低估。"],
    practiceActions: ["记录 PB、ROE、不良率和拨备覆盖率。"],
    relatedIds: ["concept-pb-pe", "concept-roe", "case-cmb-600036"],
    order: 46
  },
  {
    id: "case-insurance",
    type: "case",
    title: "保险案例",
    period: "A 股案例",
    school: "金融股",
    summary: "用于理解内含价值、长期负债、投资收益率和新业务价值。",
    coreIdeas: ["内含价值", "长期负债", "投资端", "新业务价值"],
    books: ["《巴菲特致股东的信》"],
    aShareNotes: ["可观察中国平安、中国人寿等公开披露。", ...sharedBoundary],
    misunderstandings: ["只看 PE，忽略保险会计复杂性。"],
    practiceActions: ["区分承保端、投资端和估值口径。"],
    relatedIds: ["concept-intrinsic-value", "concept-pb-pe"],
    order: 47
  },
  {
    id: "case-cyclical-coal",
    type: "case",
    title: "煤炭或资源品案例",
    period: "A 股案例",
    school: "周期股",
    summary: "用于理解周期中枢利润、供需、资本开支和商品价格波动。",
    coreIdeas: ["中枢利润", "供需周期", "资本开支", "价格弹性"],
    books: ["《安全边际》"],
    aShareNotes: ["可观察中国神华、陕西煤业等公开数据。", ...sharedBoundary],
    misunderstandings: ["用景气顶点利润给周期股估值。"],
    practiceActions: ["估算悲观、中性、乐观三种商品价格下的利润。"],
    relatedIds: ["school-contrarian", "concept-pb-pe", "case-shenhua-601088"],
    order: 48
  },
  {
    id: "case-chemical-cycle",
    type: "case",
    title: "化工周期案例",
    period: "A 股案例",
    school: "周期制造",
    summary: "用于理解产能、库存、价差、资本开支和周期扩张风险。",
    coreIdeas: ["产能周期", "价差", "库存", "资本开支"],
    books: ["《证券分析》"],
    aShareNotes: ["可观察万华化学等公开资料中的周期与竞争优势。", ...sharedBoundary],
    misunderstandings: ["把周期高利润当成常态利润。"],
    practiceActions: ["跟踪产品价差和新增产能。"],
    relatedIds: ["case-cyclical-coal", "concept-value-trap", "case-wanhua-600309"],
    order: 49
  },
  {
    id: "case-home-appliance",
    type: "case",
    title: "家电案例",
    period: "A 股案例",
    school: "成熟消费制造",
    summary: "用于理解成熟行业中的品牌、渠道、现金流、分红和竞争格局。",
    coreIdeas: ["现金流", "渠道效率", "成熟增长", "分红"],
    books: ["《彼得·林奇的成功投资》"],
    aShareNotes: ["可观察美的集团、格力电器等公开资料。", ...sharedBoundary],
    misunderstandings: ["成熟行业没有研究价值。"],
    practiceActions: ["比较自由现金流、分红和再投资需求。"],
    relatedIds: ["concept-free-cash-flow", "person-peter-lynch", "case-midea-000333"],
    order: 50
  },
  {
    id: "case-new-energy-manufacturing",
    type: "case",
    title: "新能源制造案例",
    period: "A 股案例",
    school: "成长制造",
    summary: "用于理解高增长、技术迭代、竞争加剧、资本开支和估值风险。",
    coreIdeas: ["高增长", "竞争", "资本开支", "反向 DCF"],
    books: ["《怎样选择成长股》"],
    aShareNotes: ["可观察宁德时代、隆基绿能等公开资料。", ...sharedBoundary],
    misunderstandings: ["赛道好等于公司回报好。"],
    practiceActions: ["倒推当前估值隐含的市场份额和利润率。"],
    relatedIds: ["concept-reverse-dcf", "school-growth-value", "case-catl-300750", "case-longi-601012"],
    order: 51
  },
  {
    id: "case-pharma-innovation",
    type: "case",
    title: "医药或创新药案例",
    period: "A 股案例",
    school: "研发驱动",
    summary: "用于理解研发投入、管线不确定性、政策支付和估值边界。",
    coreIdeas: ["研发管线", "临床风险", "支付政策", "估值边界"],
    books: ["《怎样选择成长股》"],
    aShareNotes: ["可观察恒瑞医药、百济神州等公开资料。", ...sharedBoundary],
    misunderstandings: ["研发投入越高越好。"],
    practiceActions: ["区分事实披露、研发假设和估值推断。"],
    relatedIds: ["person-philip-fisher", "concept-margin-of-safety", "case-hengrui-600276"],
    order: 52
  },
  {
    id: "case-midea-000333",
    type: "case",
    title: "美的集团案例",
    period: "A 股真实公司",
    school: "成熟消费制造",
    summary: "用美的集团训练成熟制造企业研究：现金流、渠道效率、海外业务、B 端延展和估值模板选择。",
    coreIdeas: ["自由现金流", "渠道效率", "全球化", "制造业估值"],
    books: ["《彼得·林奇的成功投资》", "《巴菲特致股东的信》"],
    aShareNotes: ["适合用制造业模板做主估值，再用消费股模板交叉验证。", ...sharedBoundary],
    misunderstandings: ["成熟行业没有研究价值；家电龙头只能按消费股 PE 估值。"],
    practiceActions: ["拆解智能家居、商业及工业解决方案和海外业务对现金流质量的影响。"],
    relatedIds: ["case-home-appliance", "concept-free-cash-flow", "concept-owner-earnings"],
    order: 53
  },
  {
    id: "case-moutai-600519",
    type: "case",
    title: "贵州茅台案例",
    period: "A 股真实公司",
    school: "高端消费",
    summary: "用贵州茅台训练品牌、渠道、提价能力、高 ROE 和高估值安全边际的边界。",
    coreIdeas: ["品牌护城河", "渠道秩序", "高 ROE", "估值边界"],
    books: ["《巴菲特致股东的信》", "《彼得·林奇的成功投资》"],
    aShareNotes: ["适合研究护城河证据，但必须同时检查估值隐含回报。", ...sharedBoundary],
    misunderstandings: ["品牌最强就能无视价格；高 ROE 永远不会均值回归。"],
    practiceActions: ["比较茅台酒、系列酒、直销占比、合同负债和经营现金流。"],
    relatedIds: ["case-baijiu-consumer", "concept-moat", "concept-good-company-good-price"],
    order: 54
  },
  {
    id: "case-cmb-600036",
    type: "case",
    title: "招商银行案例",
    period: "A 股真实公司",
    school: "金融股",
    summary: "用招商银行训练 PB-ROE、资产质量、净息差、拨备和零售银行护城河研究。",
    coreIdeas: ["PB-ROE", "资产质量", "拨备覆盖", "零售金融"],
    books: ["《证券分析》"],
    aShareNotes: ["适合学习银行不能只看破净，必须结合 ROE 和资产质量。", ...sharedBoundary],
    misunderstandings: ["银行破净就一定低估；零售优势可以不看周期。"],
    practiceActions: ["记录 ROE、净息差、不良率、拨备覆盖率和资本充足率的变化。"],
    relatedIds: ["case-bank", "concept-pb-pe", "concept-roe"],
    order: 55
  },
  {
    id: "case-shenhua-601088",
    type: "case",
    title: "中国神华案例",
    period: "A 股真实公司",
    school: "周期股",
    summary: "用中国神华训练煤电运一体化、周期中枢利润、资本开支和高股息可持续性研究。",
    coreIdeas: ["中枢利润", "一体化经营", "资本开支", "股息可持续"],
    books: ["《安全边际》", "《证券分析》"],
    aShareNotes: ["适合学习周期股不能用景气顶部利润估值。", ...sharedBoundary],
    misunderstandings: ["高股息可以替代周期判断；资源品利润稳定不需要情景估值。"],
    practiceActions: ["用煤价悲观、中性、乐观三情景估算利润和现金流。"],
    relatedIds: ["case-cyclical-coal", "school-contrarian", "concept-pb-pe"],
    order: 56
  },
  {
    id: "case-wanhua-600309",
    type: "case",
    title: "万华化学案例",
    period: "A 股真实公司",
    school: "周期制造",
    summary: "用万华化学训练化工周期、成本优势、产品价差、平台化扩张和资本开支风险。",
    coreIdeas: ["成本优势", "价差周期", "平台化", "资本开支"],
    books: ["《证券分析》"],
    aShareNotes: ["适合学习好公司也会受周期和产能影响。", ...sharedBoundary],
    misunderstandings: ["龙头化工公司可以直接用高景气利润估值。"],
    practiceActions: ["跟踪产品价差、在建工程、毛利率和经营现金流。"],
    relatedIds: ["case-chemical-cycle", "concept-value-trap", "concept-free-cash-flow"],
    order: 57
  },
  {
    id: "case-catl-300750",
    type: "case",
    title: "宁德时代案例",
    period: "A 股真实公司",
    school: "成长制造",
    summary: "用宁德时代训练动力电池、储能、技术迭代、价格竞争和反向 DCF。",
    coreIdeas: ["技术迭代", "份额", "价格竞争", "反向 DCF"],
    books: ["《怎样选择成长股》"],
    aShareNotes: ["适合学习高成长赛道中的竞争、资本开支和估值隐含预期。", ...sharedBoundary],
    misunderstandings: ["赛道空间大就等于股东回报确定。"],
    practiceActions: ["倒推当前估值需要的长期出货、毛利率和市场份额。"],
    relatedIds: ["case-new-energy-manufacturing", "concept-reverse-dcf", "school-growth-value"],
    order: 58
  },
  {
    id: "case-longi-601012",
    type: "case",
    title: "隆基绿能案例",
    period: "A 股真实公司",
    school: "新能源周期制造",
    summary: "用隆基绿能训练光伏产能周期、技术路线、资产减值和价值陷阱排查。",
    coreIdeas: ["产能周期", "技术路线", "资产减值", "价值陷阱"],
    books: ["《安全边际》", "《怎样选择成长股》"],
    aShareNotes: ["适合学习好赛道也可能出现供需错配和利润下行。", ...sharedBoundary],
    misunderstandings: ["需求长期增长就能抵消短期产能过剩。"],
    practiceActions: ["检查存货、固定资产、毛利率、现金流和技术路线变化。"],
    relatedIds: ["case-new-energy-manufacturing", "concept-value-trap", "concept-margin-of-safety"],
    order: 59
  },
  {
    id: "case-hengrui-600276",
    type: "case",
    title: "恒瑞医药案例",
    period: "A 股真实公司",
    school: "研发驱动",
    summary: "用恒瑞医药训练创新药研发投入、临床管线、医保支付、海外授权和估值边界。",
    coreIdeas: ["研发管线", "商业化", "支付政策", "估值边界"],
    books: ["《怎样选择成长股》"],
    aShareNotes: ["适合学习研发投入不是价值本身，要看管线质量和商业化结果。", ...sharedBoundary],
    misunderstandings: ["研发费用越高越好；创新药估值可以不看现金流。"],
    practiceActions: ["把研发投入拆成管线阶段、获批产品、商业化和海外授权四类证据。"],
    relatedIds: ["case-pharma-innovation", "person-philip-fisher", "concept-margin-of-safety"],
    order: 60
  }
];

export const knowledgeNodes = rawKnowledgeNodes.toSorted((a, b) => a.order - b.order);

export function getKnowledgeNode(id: string) {
  return knowledgeNodes.find((node) => node.id === id);
}

export function getRelatedNodes(node: KnowledgeNode) {
  return node.relatedIds
    .map((id) => getKnowledgeNode(id))
    .filter((item): item is KnowledgeNode => Boolean(item));
}
