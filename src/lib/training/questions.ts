export type TrainingQuestionType = "concept" | "scenario" | "case";

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
  case: "案例题"
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
  }
];
