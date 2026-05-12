"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, CheckCircle2, CircleAlert, History, RotateCcw, Trophy } from "lucide-react";
import type { TrainingQuestion, TrainingQuestionType } from "@/lib/training/questions";
import { questionTypeLabels } from "@/lib/training/questions";
import type { TrainingResultRow } from "@/lib/learning/progress";

type TrainingArenaProps = {
  questions: TrainingQuestion[];
  recentResults: TrainingResultRow[];
  onSaveResult: (input: TrainingResultPayload) => Promise<void>;
};

type TrainingResultPayload = {
  questionSet: string[];
  answers: Record<string, string>;
  weakTopics: string[];
  answeredCount: number;
  correctCount: number;
  score: number;
  reviewAdvice: string;
  examinerPrompt: string;
};

const filters: Array<{ value: "all" | TrainingQuestionType; label: string }> = [
  { value: "all", label: "全部" },
  { value: "concept", label: "概念题" },
  { value: "scenario", label: "场景题" },
  { value: "case", label: "案例题" },
  { value: "counterintuitive", label: "反常识题" }
];

export function TrainingArena({ questions, recentResults, onSaveResult }: TrainingArenaProps) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<"all" | TrainingQuestionType>("all");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedSignature, setSavedSignature] = useState("");
  const [isSaving, startSaving] = useTransition();
  const visibleQuestions = useMemo(
    () => (activeType === "all" ? questions : questions.filter((question) => question.type === activeType)),
    [activeType, questions]
  );
  const result = useMemo(() => {
    const answered = questions.filter((question) => answers[question.id]);
    const correct = answered.filter((question) => answers[question.id] === question.correctOptionId);

    return {
      answered: answered.length,
      correct: correct.length,
      score: answered.length === 0 ? 0 : Math.round((correct.length / answered.length) * 100)
    };
  }, [answers, questions]);

  function selectAnswer(questionId: string, optionId: string) {
    if (submitted) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId
    }));
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setSavedSignature("");
  }

  const weakQuestions = submitted
    ? questions.filter((question) => answers[question.id] && answers[question.id] !== question.correctOptionId)
    : [];
  const weakTopics = useMemo(
    () =>
      Array.from(
        new Set(
          questions
            .filter((question) => answers[question.id] && answers[question.id] !== question.correctOptionId)
            .map((question) => question.topic)
        )
      ),
    [answers, questions]
  );
  const reviewAdvice = getScoreAdvice(result.score);
  const examinerDraft = buildExaminerDraft(questions, answers);

  function submitTraining() {
    setSubmitted(true);

    const signature = JSON.stringify(answers);
    if (result.answered === 0 || signature === savedSignature) {
      return;
    }

    startSaving(async () => {
      await onSaveResult({
        questionSet: questions.map((question) => question.id),
        answers,
        weakTopics,
        answeredCount: result.answered,
        correctCount: result.correct,
        score: result.score,
        reviewAdvice,
        examinerPrompt: examinerDraft
      });
      setSavedSignature(signature);
      router.refresh();
    });
  }

  return (
    <main className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">价值投资训练场</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">把“我懂了”变成可检验的理解</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              用概念题、场景题和 A 股案例题检查学习漏洞。系统只做学习反馈，不输出买卖建议。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3 text-center">
            <Metric label="题目" value={questions.length} />
            <Metric label="已答" value={result.answered} />
            <Metric label="得分" value={submitted ? result.score : 0} suffix="%" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveType(filter.value)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  activeType === filter.value
                    ? "border-primary bg-muted"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submitTraining}
              disabled={result.answered === 0}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <Trophy className="h-4 w-4" aria-hidden />
              {isSaving ? "保存中" : "提交测验"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              重做
            </button>
          </div>
        </div>
      </section>

      {submitted ? (
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">掌握度报告</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                本次答对 {result.correct} / {result.answered} 题，得分 {result.score}%。{getScoreAdvice(result.score)}
              </p>
              {weakQuestions.length > 0 ? (
                <div className="mt-3 text-sm leading-6 text-muted-foreground">
                  建议优先复习：{weakQuestions.map((question) => question.topic).join("、")}。
                </div>
              ) : null}
            </div>
            <Link
              href={`/mentor?role=examiner&draft=${encodeURIComponent(examinerDraft)}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              <Bot className="h-4 w-4" aria-hidden />
              让 AI 考官追问
            </Link>
          </div>
        </section>
      ) : null}

      <RecentResultsPanel results={recentResults} />

      <section className="grid gap-4">
        {visibleQuestions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            selectedOptionId={answers[question.id]}
            submitted={submitted}
            onSelect={selectAnswer}
          />
        ))}
      </section>
    </main>
  );
}

function RecentResultsPanel({ results }: { results: TrainingResultRow[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">最近训练</h2>
      </div>
      {results.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          还没有训练记录。完成一次测验后，这里会保留得分、薄弱主题和复习建议。
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {results.map((result) => {
            const weakTopics = parseStringArray(result.weakTopicsJson);
            return (
              <div key={result.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="font-semibold">
                    得分 {result.score}% · 答对 {result.correctCount}/{result.answeredCount}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(result.createdAt)}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.reviewAdvice}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(weakTopics.length > 0 ? weakTopics : ["暂无明显薄弱主题"]).map((topic) => (
                    <span key={topic} className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function QuestionCard({
  index,
  question,
  selectedOptionId,
  submitted,
  onSelect
}: {
  index: number;
  question: TrainingQuestion;
  selectedOptionId?: string;
  submitted: boolean;
  onSelect: (questionId: string, optionId: string) => void;
}) {
  const isCorrect = selectedOptionId === question.correctOptionId;
  const statusVisible = submitted && selectedOptionId;

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
            <span>第 {index + 1} 题</span>
            <span>/</span>
            <span>{questionTypeLabels[question.type]}</span>
            <span>/</span>
            <span>{question.topic}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold">{question.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.prompt}</p>
        </div>
        <Link
          href={`/learn/${question.relatedNodeId}`}
          className="inline-flex shrink-0 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          复习节点
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id;
          const correct = question.correctOptionId === option.id;
          const showCorrect = submitted && correct;
          const showWrong = submitted && selected && !correct;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(question.id, option.id)}
              className={`rounded-lg border p-4 text-left text-sm leading-6 transition ${
                showCorrect
                  ? "border-primary bg-muted"
                  : showWrong
                    ? "border-border bg-background"
                    : selected
                      ? "border-primary bg-background"
                      : "border-border bg-background hover:border-primary hover:bg-muted"
              }`}
            >
              <span className="font-semibold">{option.id.toUpperCase()}.</span> {option.text}
            </button>
          );
        })}
      </div>

      {statusVisible ? (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            )}
            <div>
              <div className="font-semibold">{isCorrect ? "理解到位" : "这里有漏洞"}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.reviewHint}</p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Metric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="min-w-20 rounded-md bg-card px-4 py-3">
      <div className="text-xl font-semibold">
        {value}
        {suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function getScoreAdvice(score: number) {
  if (score >= 85) {
    return "整体掌握不错，可以进入案例分析和反方质询。";
  }

  if (score >= 60) {
    return "基础已经搭起来了，但还需要回到错题对应节点补概念边界。";
  }

  return "建议先回到学习地图复习安全边际、市场先生、ROE、价值陷阱等核心节点。";
}

function buildExaminerDraft(questions: TrainingQuestion[], answers: Record<string, string>) {
  const answered = questions.filter((question) => answers[question.id]);
  const wrong = answered.filter((question) => answers[question.id] !== question.correctOptionId);

  if (answered.length === 0) {
    return "请作为价值投资考官，围绕安全边际、市场先生、ROE 和价值陷阱给我做一次入门测验。";
  }

  return `请作为价值投资考官，基于我的训练结果继续追问。我完成了 ${answered.length} 道题，其中薄弱主题是：${
    wrong.length > 0 ? wrong.map((question) => question.topic).join("、") : "暂时没有明显错题"
  }。请不要直接给标准答案，先用 3 个追问检查我是否真的理解。`;
}
