export type TrainingQuestionType = "concept" | "scenario" | "case" | "counterintuitive";

export type TrainingQuestion = {
  id: string;
  type: TrainingQuestionType;
  topic: string;
  title: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctOptionId: string;
  explanation: string;
  reviewHint: string;
  relatedNodeId: string;
};

export const questionTypeLabels: Record<TrainingQuestionType, string> = {
  concept: "概念题",
  scenario: "场景题",
  case: "案例题",
  counterintuitive: "反常识题"
};

export const trainingQuestions: TrainingQuestion[] = [
  {
    id: "q-margin-of-safety-definition",
    type: "concept",
    topic: "安全边际",
    title: "安全边际到底保护什么？",
    prompt: "下面哪种说法最符合价值投资里的“安全边际”？",
    options: [
      {
        id: "a",
        text: "只要股价比历史高点跌了 30%，就有安全边际。"
      },
      {
        id: "b",
        text: "用保守估值和价格纪律，为估值错误、经营变化和风险事件预留缓冲。"
      },
      {
        id: "c",
        text: "买入低 PE 公司，因为低 PE 天然代表低风险。"
      },
      {
        id: "d",
        text: "只要公司足够优秀，就不需要考虑买入价格。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "安全边际不是固定折扣，也不是跌幅。它保护的是你的估值错误、信息不完整和未来不确定性。",
    reviewHint: "回到“安全边际”节点，重点复习保守假设、错误容忍度和价格纪律。",
    relatedNodeId: "concept-margin-of-safety"
  },
  {
    id: "q-market-mr-action",
    type: "scenario",
    topic: "市场先生",
    title: "大跌时应该先看什么？",
    prompt:
      "你观察的一家公司当天因市场整体恐慌下跌 8%，公司没有发布新的重大公告。更符合“市场先生”框架的第一步是？",
    options: [
      {
        id: "a",
        text: "立刻买入，因为跌得多就说明便宜。"
      },
      {
        id: "b",
        text: "立刻卖出，因为市场一定知道你不知道的信息。"
      },
      {
        id: "c",
        text: "把价格波动和企业价值变化分开，检查基本面、估值假设和风险是否变化。"
      },
      {
        id: "d",
        text: "不看公司，只看技术指标决定。"
      }
    ],
    correctOptionId: "c",
    explanation:
      "市场先生每天报价，但报价不是命令。价值投资者要先判断企业价值是否改变，而不是被价格牵着走。",
    reviewHint: "复习“市场先生”和“不操作也是决策”，练习把事实和情绪分开。",
    relatedNodeId: "concept-market-mr"
  },
  {
    id: "q-roe-quality",
    type: "concept",
    topic: "ROE",
    title: "高 ROE 一定是好公司吗？",
    prompt: "一家 A 股公司 ROE 连续三年超过 25%。更稳健的下一步分析是什么？",
    options: [
      {
        id: "a",
        text: "直接判断它是好公司，因为 ROE 越高越好。"
      },
      {
        id: "b",
        text: "拆解 ROE 来源，检查利润率、周转率、杠杆、现金流和可持续性。"
      },
      {
        id: "c",
        text: "只看股价是否上涨，涨了就说明 ROE 有效。"
      },
      {
        id: "d",
        text: "只要行业热门，就不用分析 ROE。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "ROE 是入口，不是结论。高 ROE 可能来自优秀商业模式，也可能来自高杠杆、周期高点或一次性收益。",
    reviewHint: "复习 ROE 节点，重点看杜邦拆解和不同行业 ROE 的差异。",
    relatedNodeId: "concept-roe"
  },
  {
    id: "q-value-trap",
    type: "case",
    topic: "价值陷阱",
    title: "低 PB 公司是不是机会？",
    prompt:
      "一家传统制造公司 PB 只有 0.6，但收入连续下滑，应收账款上升，经营现金流连续两年为负。更合理的判断是？",
    options: [
      {
        id: "a",
        text: "PB 低于 1 就是破净，必然安全。"
      },
      {
        id: "b",
        text: "先把它视为可能的价值陷阱，继续排查资产质量、现金流和行业衰退风险。"
      },
      {
        id: "c",
        text: "只要公司上市时间久，就不用担心。"
      },
      {
        id: "d",
        text: "亏现金流不重要，只要账面净资产高就行。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "低估值只是线索。收入下滑、应收增加和现金流为负，说明账面资产和盈利质量都需要重新验证。",
    reviewHint: "复习“价值陷阱”和《证券分析》的资产价值部分。",
    relatedNodeId: "concept-value-trap"
  },
  {
    id: "q-good-company-price",
    type: "scenario",
    topic: "好公司与好价格",
    title: "优秀公司能否无视价格？",
    prompt:
      "一家消费龙头品牌强、现金流好，但当前价格已经隐含未来多年高速增长。价值投资者更应该关注什么？",
    options: [
      {
        id: "a",
        text: "只要公司优秀，任何价格都可以接受。"
      },
      {
        id: "b",
        text: "当前价格隐含的增长和回报率是否合理，安全边际是否足够。"
      },
      {
        id: "c",
        text: "只看品牌知名度，不看估值。"
      },
      {
        id: "d",
        text: "只要别人也喜欢这家公司，就可以忽略风险。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "好公司也需要好价格。买入价格决定未来回报率，过高预期会压缩长期收益。",
    reviewHint: "复习“好公司与好价格”和反向 DCF。",
    relatedNodeId: "concept-good-company-good-price"
  },
  {
    id: "q-reverse-dcf",
    type: "case",
    topic: "反向 DCF",
    title: "高估值成长股怎么质疑？",
    prompt:
      "一家新能源制造公司市值很高，市场预期乐观。你想判断价格是否透支，最适合先做什么？",
    options: [
      {
        id: "a",
        text: "倒推当前市值隐含的收入、利润率和增长年限，再判断这些假设是否现实。"
      },
      {
        id: "b",
        text: "只看行业空间大不大。"
      },
      {
        id: "c",
        text: "只看过去一年股价涨幅。"
      },
      {
        id: "d",
        text: "只要公司增长快，就不用考虑竞争和资本开支。"
      }
    ],
    correctOptionId: "a",
    explanation:
      "反向 DCF 的价值在于把价格里的乐观假设显性化，然后用商业现实和竞争格局去质疑。",
    reviewHint: "复习“反向 DCF”和新能源制造案例。",
    relatedNodeId: "concept-reverse-dcf"
  },
  {
    id: "q-do-nothing",
    type: "scenario",
    topic: "不操作",
    title: "什么时候不操作是主动决策？",
    prompt:
      "你看好一家银行，但暂时无法判断资产质量趋势，估值也没有明显安全边际。更符合投资纪律的动作是？",
    options: [
      {
        id: "a",
        text: "先买一点，否则可能错过。"
      },
      {
        id: "b",
        text: "把它放入观察池，列出待确认问题，等待理解和价格同时满足。"
      },
      {
        id: "c",
        text: "因为是银行，所以不用研究资产质量。"
      },
      {
        id: "d",
        text: "只要分红率高就立刻行动。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "不操作不是懒惰，而是在理解、价格、安全边际不满足时保留选择权。",
    reviewHint: "复习“不操作也是决策”和银行案例。",
    relatedNodeId: "concept-do-nothing"
  },
  {
    id: "q-financial-bank",
    type: "case",
    topic: "银行估值",
    title: "银行不能只看 PE",
    prompt: "研究银行时，下面哪组指标更能帮助理解 PB 估值是否合理？",
    options: [
      {
        id: "a",
        text: "PB、ROE、不良率、拨备覆盖率、净息差。"
      },
      {
        id: "b",
        text: "昨日涨跌幅、热门程度、社交媒体讨论数。"
      },
      {
        id: "c",
        text: "只看 PE，越低越好。"
      },
      {
        id: "d",
        text: "只看分红，不看资产质量。"
      }
    ],
    correctOptionId: "a",
    explanation:
      "银行是资本和资产质量驱动的行业，PB-ROE、不良和拨备比单一 PE 更能体现风险和回报。",
    reviewHint: "复习 PB 与 PE、ROE 和银行案例。",
    relatedNodeId: "case-bank"
  },
  {
    id: "q-counterintuitive-fallen-knife",
    type: "counterintuitive",
    topic: "下跌不等于低估",
    title: "跌得多就是便宜吗？",
    prompt: "一家公司股价从高点回撤了 50%，市场情绪很悲观。价值投资者更应该怎么做？",
    options: [
      {
        id: "a",
        text: "跌得多就等于便宜，直接按原来的理由加仓。"
      },
      {
        id: "b",
        text: "重新估值，判断内在价值是否也在下调，再比较当前价格和保守价值区间。"
      },
      {
        id: "c",
        text: "跌了就卖，因为市场一定比自己更懂。"
      },
      {
        id: "d",
        text: "等所有人都说底部到了再行动。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "股价是价格，不是价值。基本面恶化时，内在价值会先下移，此时的“便宜”可能是价值陷阱。要把价格和重新估算的价值分开比较。",
    reviewHint: "复习“市场先生”“价值陷阱”和“安全边际”，练习分离价格与价值。",
    relatedNodeId: "concept-value-trap"
  },
  {
    id: "q-counterintuitive-high-dividend",
    type: "counterintuitive",
    topic: "高股息不等于安全",
    title: "分红高就一定没风险吗？",
    prompt: "一家传统行业公司股息率高达 9%，但收入连续下滑、经营现金流明显低于分红总额。更合理的判断是？",
    options: [
      {
        id: "a",
        text: "股息率越高越好，分红是确定收益。"
      },
      {
        id: "b",
        text: "高股息可能是股价先跌出来的，要检查分红是否由利润和现金流持续覆盖。"
      },
      {
        id: "c",
        text: "只看分红率，不用看负债和资本开支。"
      },
      {
        id: "d",
        text: "历史上分红高，未来就一定能继续。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "股息率 = 每股分红 / 股价，股价下跌也会把股息率推高。如果现金流不足以覆盖分红，后续可能靠举债或消耗账面现金，纪律上不能当作“无风险收益”。",
    reviewHint: "复习“自由现金流”“所有者收益”和周期股估值，重点看现金流-分红-资本开支关系。",
    relatedNodeId: "concept-free-cash-flow"
  },
  {
    id: "q-counterintuitive-growth",
    type: "counterintuitive",
    topic: "高增长不等于好投资",
    title: "公司增速高就能买吗？",
    prompt: "一家成长型公司未来 3 年收入复合增速可能达到 40%，但当前估值隐含的增长要求更高、经营现金流长期为负。价值投资者更应关注？",
    options: [
      {
        id: "a",
        text: "只要收入能增长 40%，任何估值都值。"
      },
      {
        id: "b",
        text: "价格里已隐含多少增长，现金流和资本开支能否支撑这种增长，以及错了多少的容错空间。"
      },
      {
        id: "c",
        text: "只看赛道热度，不看估值。"
      },
      {
        id: "d",
        text: "假设管理层指引一定兑现。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "增长本身不创造价值，ROIC 高于资本成本的增长才创造价值。如果价格已经透支未来增速，即便业务兑现，长期回报也可能平庸；一旦不及预期，估值和业绩还会双杀。",
    reviewHint: "复习“反向 DCF”“好公司与好价格”，练习从市值倒推市场预期。",
    relatedNodeId: "concept-reverse-dcf"
  },
  {
    id: "q-counterintuitive-low-pe",
    type: "counterintuitive",
    topic: "低 PE 不等于便宜",
    title: "PE 很低是不是就便宜？",
    prompt: "一家周期行业龙头当前 PE 只有 5 倍，公司所在行业处于明显景气高点。最稳健的估值思路是？",
    options: [
      {
        id: "a",
        text: "PE 越低越便宜，立即视为深度价值。"
      },
      {
        id: "b",
        text: "周期顶部的 E 是偏高的，应该用跨周期中枢利润乘合理 PE 再比较。"
      },
      {
        id: "c",
        text: "用当前 PE 简单乘以历史均值就算合理估值。"
      },
      {
        id: "d",
        text: "既然是龙头就不需要考虑周期。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "对周期股来说，景气高点对应的是高利润低 PE，景气底部往往是低利润高 PE。用单年利润乘 PE 会高估周期股价值，应该用跨周期中枢利润或归一化利润。",
    reviewHint: "复习 PE、周期股估值模板和中国神华、万华化学等案例。",
    relatedNodeId: "case-cyclical-coal"
  },
  {
    id: "q-counterintuitive-consensus",
    type: "counterintuitive",
    topic: "一致看好不等于低风险",
    title: "大家都看好就安全吗？",
    prompt: "某行业最近被多家卖方研报一致上调评级，预期高度一致。价值投资者应如何处理这种一致预期？",
    options: [
      {
        id: "a",
        text: "一致预期越强越安全，跟随加仓。"
      },
      {
        id: "b",
        text: "一致预期通常已反映在价格里，关键是自己独立验证事实，并检查超预期和不及预期的风险回报。"
      },
      {
        id: "c",
        text: "只要报告数量多，就等于事实成立。"
      },
      {
        id: "d",
        text: "不需要写反方观点，因为市场不会错。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "一致预期不是风险低，而是价格可能已充分定价，上行空间压缩而下行敏感度放大。价值投资者要独立复核事实，并练习写反方观点。",
    reviewHint: "复习“证据先于故事”“反方验证”，用反方委员视角追问一次当前热点。",
    relatedNodeId: "concept-good-company-good-price"
  },
  {
    id: "q-case-moutai-moat",
    type: "case",
    topic: "消费龙头护城河",
    title: "茅台的护城河该怎么验证？",
    prompt: "研究贵州茅台时，下面哪种做法更符合价值投资的护城河验证思路？",
    options: [
      {
        id: "a",
        text: "只看白酒行业空间和渠道库存数据，就下结论品牌很强。"
      },
      {
        id: "b",
        text: "拆解品牌溢价、定价权、毛利率、现金流和渠道利益链，看护城河是否在维持或变宽。"
      },
      {
        id: "c",
        text: "只看股价长期上涨，就认为护城河一定存在。"
      },
      {
        id: "d",
        text: "只要大家都说有护城河，就不用自己验证。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "护城河不是标签，必须通过毛利率、定价权、渠道结构、品牌溢价和现金流长期一致性验证，还要检查是否正在扩宽或被稀释。",
    reviewHint: "复习“护城河”“好公司与好价格”，回到茅台案例复盘消费龙头估值纪律。",
    relatedNodeId: "case-moutai-600519"
  },
  {
    id: "q-case-cmb-retail",
    type: "case",
    topic: "零售银行估值",
    title: "零售银行可以无视周期吗？",
    prompt: "研究招商银行时，下列说法哪一项更稳健？",
    options: [
      {
        id: "a",
        text: "零售银行不会有坏账，所以不用看资产质量。"
      },
      {
        id: "b",
        text: "零售业务可能提升 ROE 和估值溢价，但仍要看不良生成、拨备覆盖、资本充足率和净息差变化。"
      },
      {
        id: "c",
        text: "只看股息率，不看资产负债结构。"
      },
      {
        id: "d",
        text: "破净就是机会，其他指标不用看。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "零售特色和财富管理可以带来估值溢价，但银行本质仍是资产和资本驱动，必须检查资产质量、资本充足率和净息差等核心指标。",
    reviewHint: "复习银行估值、PB-ROE 以及招商银行案例。",
    relatedNodeId: "case-cmb-600036"
  },
  {
    id: "q-case-shenhua-cycle",
    type: "case",
    topic: "周期龙头估值",
    title: "中国神华怎么避免把顶部当常态？",
    prompt: "研究中国神华时，哪种估值思路更符合周期股纪律？",
    options: [
      {
        id: "a",
        text: "用当年单一利润乘周期中枢 PE，得到内在价值。"
      },
      {
        id: "b",
        text: "用跨周期的中枢利润、长协比例、成本曲线和一体化优势，再乘相对保守的周期 PE。"
      },
      {
        id: "c",
        text: "只看股息率，不看煤价和产能利用率。"
      },
      {
        id: "d",
        text: "假设当前煤价就是长期价格。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "周期股估值的核心是找到跨周期可维持的中枢利润，而不是把单年利润永续化。还要结合长协比例、成本曲线和现金流，避免把顶部当常态。",
    reviewHint: "复习周期股模板、归一化 PE，以及中国神华案例。",
    relatedNodeId: "case-shenhua-601088"
  },
  {
    id: "q-case-catl-growth",
    type: "case",
    topic: "成长股估值纪律",
    title: "宁德时代增长叙事该如何验证？",
    prompt: "研究宁德时代时，哪种做法更符合价值投资纪律？",
    options: [
      {
        id: "a",
        text: "只要电池装机量持续增长，就把增长永续化。"
      },
      {
        id: "b",
        text: "拆解客户结构、毛利率、资本开支和自由现金流，用反向 DCF 检查价格隐含的增长是否现实。"
      },
      {
        id: "c",
        text: "只看行业空间，不看竞争格局。"
      },
      {
        id: "d",
        text: "只要市占率第一，任何价格都合理。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "成长股估值最怕把线性增长永续化。必须拆解利润结构、资本开支、现金流质量，并用反向 DCF 检查市场已经隐含了多少增长预期。",
    reviewHint: "复习“反向 DCF”“自由现金流”以及宁德时代案例。",
    relatedNodeId: "case-catl-300750"
  },
  {
    id: "q-case-huayou-cycle",
    type: "case",
    topic: "资源 + 材料一体化",
    title: "华友钴业该用什么估值工具？",
    prompt: "研究华友钴业时，哪套估值组合更合适？",
    options: [
      {
        id: "a",
        text: "直接套用消费股 PE，因为公司属于新能源赛道。"
      },
      {
        id: "b",
        text: "以周期制造中枢利润法为主，再用 PB / 资产负债表压力测试和反向 DCF 做交叉验证。"
      },
      {
        id: "c",
        text: "只看一季度利润同比，就把全年利润年化。"
      },
      {
        id: "d",
        text: "只看镍钴锂价格涨幅，不看资本开支和负债。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "华友的利润同时受资源价格、材料价差、产能利用率和资本开支影响，属于周期制造。消费股 PE 会忽略周期，单年利润年化会放大误差；应该用中枢利润法为主，并检查资产负债表。",
    reviewHint: "复习周期制造估值、反向 DCF，以及华友钴业估值走读。",
    relatedNodeId: "case-huayou-603799"
  },
  {
    id: "q-case-wanhua-cycle-bottom",
    type: "case",
    topic: "周期底部判断",
    title: "万华化学的周期底部怎么验证？",
    prompt: "研究万华化学时，哪种思路更有助于判断周期底部？",
    options: [
      {
        id: "a",
        text: "只看产品价格是否跌到历史低位，就认为是底部。"
      },
      {
        id: "b",
        text: "同时看产品价差、行业产能利用率、成本曲线位置、公司现金流和资本开支，再判断利润中枢是否接近低点。"
      },
      {
        id: "c",
        text: "只看同行业公司股价是否反弹。"
      },
      {
        id: "d",
        text: "只要周期股跌得多，就一定到底。"
      }
    ],
    correctOptionId: "b",
    explanation:
      "产品价格只是一个维度，周期底部的确认需要综合价差、开工率、成本曲线、现金流和资本开支。单看价格容易误把下行中段当成底部。",
    reviewHint: "复习周期股模板、成本曲线分析，以及万华化学案例。",
    relatedNodeId: "case-wanhua-600309"
  }
];
