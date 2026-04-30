"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookText,
  CheckCircle2,
  CircleDot,
  Factory,
  Loader2,
  MessageSquareQuote,
  ShoppingBag,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  SquareCheckBig,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  type SurveyAnswerValue,
  type SurveyOption,
  type SurveyQuestion,
  type SurveyQuestionType,
  type SurveyResultDetails,
  getDefaultAnswer,
  isAnswered,
} from "@/lib/survey";

type SurveyTypeMeta = {
  id: number;
  key: "general" | "farm" | "factory" | "shop";
  name: string;
  description: string;
  icon: typeof BookText;
  accent: string;
  softAccent: string;
};

const surveyTypes: SurveyTypeMeta[] = [
  {
    id: 396,
    key: "general",
    name: "Khảo sát chung",
    description: "Ghi nhận ý kiến chung để MEVI hỗ trợ bà con rõ ràng hơn.",
    icon: BookText,
    accent: "var(--mevi-green-700)",
    softAccent: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: 397,
    key: "farm",
    name: "MEVI FARM",
    description: "Phù hợp với nhu cầu canh tác, theo dõi mùa vụ và nông trại.",
    icon: Sprout,
    accent: "#15803d",
    softAccent: "rgba(34, 197, 94, 0.12)",
  },
  {
    id: 398,
    key: "factory",
    name: "MEVI FACTORY",
    description:
      "Phù hợp với quy trình sơ chế, chế biến và kiểm soát chất lượng.",
    icon: Factory,
    accent: "#c2410c",
    softAccent: "rgba(249, 115, 22, 0.12)",
  },
  {
    id: 399,
    key: "shop",
    name: "MEVI SHOP",
    description:
      "Phù hợp với nhu cầu bán hàng, chăm sóc khách hàng và vận hành.",
    icon: ShoppingBag,
    accent: "#7c3aed",
    softAccent: "rgba(168, 85, 247, 0.12)",
  },
];

const GENERAL_SURVEY_ID = 396;
const INTRO_USER_QUESTION_ID = 8001;

const introQuestions: SurveyQuestion[] = [
  {
    id: INTRO_USER_QUESTION_ID,
    code: "INTRO-USER",
    content: "Bạn muốn giải quyết vấn đề nào nhất khi tham gia App MEVI?",
    helperText:
      "Bạn có thể chọn nhiều mục phù hợp nhất với nhu cầu hiện tại của mình.",
    type: "multiple_choice",
    source: "demo",
    options: surveyTypes.map((survey) => ({
      id: survey.id,
      label: survey.name,
      description: survey.description,
    })),
  },
];

function createDemoQuestion(
  surveyPeriodId: number,
  index: number,
  question: Omit<SurveyQuestion, "id" | "source">,
): SurveyQuestion {
  return {
    ...question,
    id: surveyPeriodId * 100 + index + 1,
    source: "demo",
  };
}

const demoSurveyDetails: Record<number, SurveyResultDetails> = {
  396: {
    id: 396,
    userCode: "MEVI-DEMO",
    userName: "Người dùng demo",
    positionName: "Khảo sát chung",
    departmentName: "MEVI",
    email: "mevi@gmail.com",
    surveyPeriodId: 396,
    surveyPeriodName: "Khảo sát chung",
    resultQuestions: [
      createDemoQuestion(396, 0, {
        code: "GEN-001",
        content: "Bạn đang quan tâm nhất đến trải nghiệm nào khi dùng MEVI?",
        helperText: "Đây là câu demo để test flow khảo sát chung.",
        type: "single_choice",
        required: true,
        options: [
          { id: 1, label: "Tìm thông tin nhanh" },
          { id: 2, label: "Theo dõi quy trình" },
          { id: 3, label: "Quản lý công việc" },
          { id: 4, label: "Kết nối kênh bán hàng" },
        ],
      }),
      createDemoQuestion(396, 1, {
        code: "GEN-002",
        content: "Bạn muốn MEVI hỗ trợ bạn tốt hơn ở điểm nào?",
        helperText: "Chọn nhiều ý phù hợp nhất với nhu cầu của bạn.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Giao diện dễ dùng" },
          { id: 2, label: "Nội dung ngắn gọn" },
          { id: 3, label: "Báo cáo rõ ràng" },
          { id: 4, label: "Có hướng dẫn chi tiết" },
        ],
      }),
      createDemoQuestion(396, 2, {
        code: "GEN-003",
        content: "Bạn có góp ý nào thêm cho khảo sát chung không?",
        helperText: "Đây là ô tự luận demo.",
        type: "essay",
        required: false,
      }),
    ],
  },
  397: {
    id: 397,
    userCode: "FARM-DEMO",
    userName: "Bà con demo Farm",
    positionName: "MEVI FARM",
    departmentName: "Nông trại",
    email: "mevi@gmail.com",
    surveyPeriodId: 397,
    surveyPeriodName: "MEVI FARM",
    resultQuestions: [
      createDemoQuestion(397, 0, {
        code: "FARM-001",
        content: "MEVI FARM giúp bạn ở khâu nào nhiều nhất?",
        helperText: "Câu demo cho phân hệ Farm.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Nhật ký sản xuất" },
          { id: 2, label: "Quản lý vật tư" },
          { id: 3, label: "Theo dõi mùa vụ" },
          { id: 4, label: "Truy xuất nguồn gốc" },
        ],
      }),
      createDemoQuestion(397, 1, {
        code: "FARM-002",
        content: "Mức độ dễ sử dụng của Farm hiện tại thế nào?",
        helperText: "Dữ liệu demo theo dạng rating.",
        type: "rating",
        required: true,
        options: [
          { id: 1, label: "1" },
          { id: 2, label: "2" },
          { id: 3, label: "3" },
          { id: 4, label: "4" },
          { id: 5, label: "5" },
        ],
        ratingMinLabel: "Khó dùng",
        ratingMaxLabel: "Rất dễ dùng",
      }),
      createDemoQuestion(397, 2, {
        code: "FARM-003",
        content: "Bạn muốn thêm tính năng nào cho Farm?",
        helperText: "Ô tự luận để test flow.",
        type: "essay",
        required: false,
      }),
    ],
  },
  398: {
    id: 398,
    userCode: "FACTORY-DEMO",
    userName: "Bà con demo Factory",
    positionName: "MEVI FACTORY",
    departmentName: "Nhà máy",
    email: "mevi@gmail.com",
    surveyPeriodId: 398,
    surveyPeriodName: "MEVI FACTORY",
    resultQuestions: [
      createDemoQuestion(398, 0, {
        code: "FAC-001",
        content: "Factory đang giúp bạn tối ưu phần nào?",
        helperText: "Chọn một đáp án demo.",
        type: "single_choice",
        required: true,
        options: [
          { id: 1, label: "Kiểm soát nguyên liệu" },
          { id: 2, label: "Quản lý sản xuất" },
          { id: 3, label: "Theo dõi chất lượng" },
          { id: 4, label: "Xuất kho thành phẩm" },
        ],
      }),
      createDemoQuestion(398, 1, {
        code: "FAC-002",
        content: "Bạn quan tâm nhóm tính năng nào của Factory?",
        helperText: "Chọn nhiều mục để test checkbox.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Quy trình sản xuất" },
          { id: 2, label: "Kiểm định chất lượng" },
          { id: 3, label: "Tối ưu công suất" },
          { id: 4, label: "Báo cáo tồn kho" },
        ],
      }),
      createDemoQuestion(398, 2, {
        code: "FAC-003",
        content: "Factory cần cải thiện gì trước tiên?",
        helperText: "Ô demo tự luận.",
        type: "essay",
        required: false,
      }),
    ],
  },
  399: {
    id: 399,
    userCode: "SHOP-DEMO",
    userName: "Bà con demo Shop",
    positionName: "MEVI SHOP",
    departmentName: "Bán hàng",
    email: "mevi@gmail.com",
    surveyPeriodId: 399,
    surveyPeriodName: "MEVI SHOP",
    resultQuestions: [
      createDemoQuestion(399, 0, {
        code: "SHOP-001",
        content: "Shop giúp bạn tốt nhất ở điểm nào?",
        helperText: "Câu demo cho phân hệ Shop.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Đa kênh bán hàng" },
          { id: 2, label: "Quản lý đơn hàng" },
          { id: 3, label: "Chăm sóc khách hàng" },
          { id: 4, label: "Theo dõi doanh thu" },
        ],
      }),
      createDemoQuestion(399, 1, {
        code: "SHOP-002",
        content: "Mức độ sẵn sàng sử dụng Shop của bạn thế nào?",
        helperText: "Đây là dạng yes/no demo.",
        type: "yes_no",
        required: true,
        options: [
          { id: 1, label: "Có" },
          { id: 0, label: "Chưa" },
        ],
      }),
      createDemoQuestion(399, 2, {
        code: "SHOP-003",
        content: "Bạn mong muốn Shop thêm điều gì?",
        helperText: "Ô tự luận để kết thúc phần demo.",
        type: "essay",
        required: false,
      }),
    ],
  },
};

const questionTypeMeta: Record<
  SurveyQuestionType,
  { label: string; icon: typeof MessageSquareQuote }
> = {
  essay: { label: "Tự luận", icon: MessageSquareQuote },
  single_choice: { label: "Chọn 1", icon: CircleDot },
  multiple_choice: { label: "Chọn nhiều", icon: SquareCheckBig },
  rating: { label: "Thang điểm", icon: SlidersHorizontal },
  yes_no: { label: "Có / Không", icon: CheckCircle2 },
};

function DecorativeLeaves() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute -right-12 -top-6 h-64 w-64 opacity-[0.04] animate-leaf-sway"
        viewBox="0 0 200 200"
      >
        <path
          d="M120 20 C160 40, 180 80, 170 130 C160 160, 130 180, 90 170 C60 160, 40 130, 50 90 C55 60, 80 30, 120 20Z"
          fill="currentColor"
          className="text-green-700"
        />
      </svg>
      <svg
        className="absolute -bottom-10 -left-16 h-52 w-52 opacity-[0.03]"
        viewBox="0 0 200 200"
        style={{ animation: "leaf-sway 4s ease-in-out infinite 1.5s" }}
      >
        <path
          d="M40 160 C20 120, 30 70, 70 40 C100 20, 140 30, 160 60 C170 80, 165 110, 140 130 C110 155, 70 170, 40 160Z"
          fill="currentColor"
          className="text-green-600"
        />
      </svg>
    </div>
  );
}

function optionIsSelected(value: SurveyAnswerValue, option: SurveyOption) {
  if (Array.isArray(value)) return value.includes(option.id);
  if (typeof value === "number") return value === option.id;
  if (typeof value === "boolean") return Number(value) === option.id;
  return false;
}

type SurveyQuestionWithMeta = SurveyQuestion & {
  surveyPeriodId?: number;
  surveyPeriodName?: string;
  originalQuestionId?: number;
};

function PortalHeader({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <nav className="relative z-10 flex flex-col gap-4 px-4 py-5 opacity-0 animate-fade-in-up sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-12">
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <img
          src="/mevi-logo.jpeg"
          alt="MEVI"
          className="h-10 w-10 rounded-xl object-contain shadow-sm"
          style={{ border: "1px solid var(--mevi-border)" }}
        />
        <div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--mevi-text-primary)" }}
          >
            MEVI
          </h1>
          <p
            className="text-[11px] font-medium leading-tight -mt-0.5 sm:text-xs"
            style={{ color: "var(--mevi-text-muted)" }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4">
        <div
          className="hidden min-w-0 items-center gap-2 text-sm sm:flex"
          style={{ color: "var(--mevi-text-secondary)" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--mevi-green-500), var(--mevi-green-700))",
            }}
          >
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="truncate font-medium">Khảo sát MEVI</span>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
          style={{
            color: accent,
            background: "rgba(255, 255, 255, 0.78)",
            border: "1px solid rgba(212, 229, 216, 0.9)",
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="truncate">{title}</span>
        </div>
      </div>
    </nav>
  );
}

function PortalFooter() {
  return (
    <footer
      className="border-t border-[rgba(212,229,216,0.7)] bg-[rgba(255,255,255,0.45)] px-4 py-4 text-center backdrop-blur-xl"
      style={{ marginTop: "auto" }}
    >
      <div className="mb-2 flex items-center justify-center gap-2">
        <img
          src="/mevi-logo.jpeg"
          alt="MEVI"
          className="h-6 w-6 rounded-lg object-contain"
        />
        <span
          className="text-sm font-bold"
          style={{ color: "var(--mevi-text-primary)" }}
        >
          MEVI
        </span>
      </div>
      <p
        className="mx-auto max-w-md text-xs leading-relaxed"
        style={{ color: "var(--mevi-text-muted)" }}
      >
        © 2026 MEVI — Hệ sinh thái Nông nghiệp thông minh. Tất cả quyền được bảo
        lưu.
      </p>
    </footer>
  );
}

function SurveyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSurveyId = Number(searchParams.get("surveyId")) || 396;
  const returnTo = searchParams.get("returnTo") ?? "/dashboard";
  const source = searchParams.get("source") ?? "login";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<
    "next" | "back"
  >("next");
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, SurveyAnswerValue>
  >({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completionTarget, setCompletionTarget] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const selectedSurveyIds = useMemo(() => {
    const selectedValue = answersByQuestion[INTRO_USER_QUESTION_ID];

    if (Array.isArray(selectedValue) && selectedValue.length > 0) {
      return [
        GENERAL_SURVEY_ID,
        ...selectedValue.filter((id) => id !== GENERAL_SURVEY_ID),
      ];
    }

    return [GENERAL_SURVEY_ID];
  }, [answersByQuestion]);

  const surveyDetails = selectedSurveyIds
    .map((surveyPeriodId) => demoSurveyDetails[surveyPeriodId])
    .filter((detail): detail is SurveyResultDetails => Boolean(detail));

  const apiQuestions: SurveyQuestionWithMeta[] = surveyDetails.flatMap(
    (surveyDetail) =>
      surveyDetail.resultQuestions.map((question) => ({
        ...question,
        surveyPeriodId: surveyDetail.surveyPeriodId,
        surveyPeriodName: surveyDetail.surveyPeriodName,
        originalQuestionId: question.id,
      })),
  );

  const wizardQuestions: SurveyQuestionWithMeta[] = [
    ...introQuestions,
    ...apiQuestions,
  ];
  const effectiveIndex = Math.min(
    currentIndex,
    Math.max(wizardQuestions.length - 1, 0),
  );
  const currentQuestion = wizardQuestions[effectiveIndex];
  const currentSurveyId =
    currentQuestion &&
    currentQuestion.surveyPeriodId
      ? currentQuestion.surveyPeriodId
      : GENERAL_SURVEY_ID;
  const currentSurvey =
    surveyTypes.find((survey) => survey.id === currentSurveyId) ??
    surveyTypes[0];
  const SurveyIcon = currentSurvey.icon;
  const portalTitle = currentSurvey.name;

  useEffect(() => {
    if (!showSuccessModal || !completionTarget) return;

    const timer = window.setTimeout(() => {
      if (completionTarget.startsWith("http")) {
        window.location.assign(completionTarget);
        return;
      }

      router.push(completionTarget);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [completionTarget, router, showSuccessModal]);

  const currentAnswers = answersByQuestion;
  const getAnswerValue = (question: SurveyQuestion) => {
    if (question.id === INTRO_USER_QUESTION_ID) {
      return currentAnswers[question.id] ?? [initialSurveyId];
    }

    return currentAnswers[question.id] ?? getDefaultAnswer(question);
  };

  const answeredCount = wizardQuestions.filter((question) =>
    isAnswered(getAnswerValue(question)),
  ).length;

  const progress = wizardQuestions.length
    ? wizardQuestions.length === 1
      ? 100
      : Math.round((effectiveIndex / (wizardQuestions.length - 1)) * 100)
    : 0;

  const updateAnswer = (questionId: number, value: SurveyAnswerValue) => {
    setAnswersByQuestion((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const toggleMultiChoice = (questionId: number, optionId: number) => {
    const currentValue = currentAnswers[questionId];
    const currentList = Array.isArray(currentValue) ? currentValue : [];

    updateAnswer(
      questionId,
      currentList.includes(optionId)
        ? currentList.filter((item) => item !== optionId)
        : [...currentList, optionId],
    );
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 450));

      return {
        answeredCount,
        totalQuestions: wizardQuestions.length,
      };
    },
    onSuccess: () => {
      setSubmitFeedback(null);
      setCompletionTarget("/dashboard");
      setShowSuccessModal(true);
    },
    onError: (error: Error) => {
      setSubmitFeedback(
        error.message || "Không hoàn tất được khảo sát. Vui lòng thử lại.",
      );
    },
  });

  const goBack = () => {
    if (effectiveIndex === 0) {
      router.push(returnTo);
      return;
    }

    setTransitionDirection("back");
    setSubmitFeedback(null);
    setCurrentIndex((value) => Math.max(0, value - 1));
  };

  const goNext = () => {
    if (!currentQuestion || submitMutation.isPending) return;

    const answerValue = getAnswerValue(currentQuestion);
    if (!isAnswered(answerValue)) {
      setSubmitFeedback("Vui lòng trả lời câu hỏi này rồi nhấn Next.");
      return;
    }

    if (effectiveIndex === wizardQuestions.length - 1) {
      setSubmitFeedback(null);
      submitMutation.mutate();
      return;
    }

    setTransitionDirection("next");
    setSubmitFeedback(null);
    setCurrentIndex((value) => Math.min(value + 1, wizardQuestions.length - 1));
  };

  const handleBackToStart = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(returnTo);
  };

  const currentQuestionClass =
    transitionDirection === "next"
      ? "animate-slide-in-right"
      : "animate-slide-in-left";

  const currentQuestionNumber = Math.min(
    effectiveIndex + 1,
    wizardQuestions.length,
  );
  const isLastQuestion = effectiveIndex === wizardQuestions.length - 1;
  const nextDisabled = submitMutation.isPending;

  return (
    <div className="mevi-portal relative flex min-h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />
      <PortalHeader
        title={portalTitle}
        subtitle={
          source === "module"
            ? "Khởi động khảo sát trước khi vào phân hệ"
            : "Đăng nhập xong là vào khảo sát ngay"
        }
        accent={currentSurvey.accent}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-[28px] p-6 shadow-2xl animate-fade-in-scale"
            style={{
              background: "rgba(255, 255, 255, 0.97)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--mevi-green-100), var(--mevi-green-200))",
                  color: "var(--mevi-green-700)",
                }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Gửi khảo sát thành công
                </p>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: "var(--mevi-text-secondary)" }}
                >
                  Cảm ơn bà con đã chia sẻ ý kiến. MEVI sẽ chuyển tiếp ngay để
                  bạn tiếp tục công việc.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!completionTarget) return;

                  if (completionTarget.startsWith("http")) {
                    window.location.assign(completionTarget);
                    return;
                  }

                  router.push(completionTarget);
                }}
                className="mevi-btn-primary w-auto px-5"
                >
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <section
            className="overflow-hidden rounded-[32px] shadow-[0_24px_60px_-36px_rgba(6,78,59,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-34px_rgba(6,78,59,0.28)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.78))",
            }}
          >
            <div
              className="px-5 py-5 sm:px-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(236,253,245,0.9), rgba(255,247,237,0.72))",
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="space-x-3 space-y-3">
                  <button
                    type="button"
                    onClick={handleBackToStart}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md"
                    style={{
                      color: "var(--mevi-text-secondary)",
                      background: "rgba(255,255,255,0.58)",
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {source === "module"
                      ? "Quay lại phân hệ"
                      : "Quay lại trang trước"}
                  </button>

                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
                    style={{
                      color: currentSurvey.accent,
                      background: currentSurvey.softAccent,
                    }}
                  >
                    <SurveyIcon className="h-3.5 w-3.5" />
                    Khảo sát MEVI
                  </div>

                  <div>
                    <h2
                      className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl"
                      style={{ color: "var(--mevi-text-primary)" }}
                    >
                      {currentSurvey.name}
                    </h2>
                    <p
                      className="mt-2 max-w-2xl text-sm leading-6 sm:text-base"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      {currentSurvey.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ background: currentSurvey.softAccent }}
                  >
                    <SurveyIcon
                      className="h-5 w-5"
                      style={{ color: currentSurvey.accent }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--mevi-text-primary)" }}
                    >
                      Câu {currentQuestionNumber} /{" "}
                      {wizardQuestions.length || 1}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--mevi-text-muted)" }}
                    >
                      {answeredCount} câu đã trả lời
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--mevi-text-secondary)] shadow-[0_10px_30px_-24px_rgba(6,78,59,0.25)]">
                  {isLastQuestion ? "Bước cuối" : "Đang khảo sát"}
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(212,229,216,0.8)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${currentSurvey.accent}, var(--mevi-green-500))`,
                    }}
                  />
                </div>
            </div>
          </section>

          {!wizardQuestions.length && (
            <section className="rounded-[28px] bg-white/75 p-6 shadow-[0_18px_50px_-34px_rgba(6,78,59,0.18)]">
              <div className="flex items-center gap-3">
                <Loader2
                  className="h-5 w-5 animate-spin"
                  style={{ color: "var(--mevi-green-700)" }}
                />
                <p style={{ color: "var(--mevi-text-secondary)" }}>
                  Đang tải câu hỏi khảo sát...
                </p>
              </div>
            </section>
          )}

          {wizardQuestions.length > 0 && currentQuestion && (
            <section className="space-y-4">
              <article
                key={currentQuestion.id}
                className={`rounded-[32px] bg-white/88 p-5 shadow-[0_24px_60px_-40px_rgba(6,78,59,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_72px_-38px_rgba(6,78,59,0.28)] sm:p-6 ${currentQuestionClass}`}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))",
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: currentSurvey.accent,
                      background: currentSurvey.softAccent,
                    }}
                  >
                    Câu {effectiveIndex + 1}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: "var(--mevi-text-muted)",
                      background: "rgba(148, 163, 184, 0.12)",
                    }}
                  >
                    {currentQuestion.code}
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: currentSurvey.accent,
                      background: currentSurvey.softAccent,
                    }}
                  >
                    {questionTypeMeta[currentQuestion.type].label}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: isAnswered(getAnswerValue(currentQuestion))
                        ? "var(--mevi-green-700)"
                        : "var(--mevi-earth-700)",
                      background: isAnswered(getAnswerValue(currentQuestion))
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(245, 158, 11, 0.14)",
                    }}
                  >
                    {isAnswered(getAnswerValue(currentQuestion))
                      ? "Đã trả lời"
                      : "Chưa trả lời"}
                  </span>
                </div>

                {currentQuestion?.surveyPeriodName && (
                  <div className="mt-3">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        color: currentSurvey.accent,
                        background: currentSurvey.softAccent,
                      }}
                    >
                      {currentQuestion.surveyPeriodName}
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  <h3
                    className="text-[1.75rem] font-bold leading-[1.25] sm:text-[2rem]"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    {currentQuestion.content}
                  </h3>
                  {currentQuestion.helperText && (
                    <p
                      className="mt-2 max-w-2xl text-sm leading-6"
                      style={{ color: "var(--mevi-text-muted)" }}
                    >
                      {currentQuestion.helperText}
                    </p>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {currentQuestion.type === "essay" && (
                    <>
                      <label
                        htmlFor={`question-${currentQuestion.id}`}
                        className="block text-sm font-medium"
                        style={{ color: "var(--mevi-text-secondary)" }}
                      >
                        Câu trả lời
                      </label>
                      <textarea
                        id={`question-${currentQuestion.id}`}
                        value={
                          typeof getAnswerValue(currentQuestion) === "string"
                            ? (getAnswerValue(currentQuestion) as string)
                            : ""
                        }
                        onChange={(event) =>
                          updateAnswer(currentQuestion.id, event.target.value)
                        }
                        placeholder="Bà con nhập câu trả lời tại đây..."
                        className="min-h-36 w-full resize-y rounded-[24px] px-4 py-4 text-sm outline-none transition-all"
                        style={{
                          color: "var(--mevi-text-primary)",
                          background: "rgba(255,255,255,0.92)",
                          border: "1.5px solid var(--mevi-border)",
                        }}
                      />
                    </>
                  )}

                  {currentQuestion.type === "single_choice" && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => {
                        const checked = optionIsSelected(
                          getAnswerValue(currentQuestion),
                          option,
                        );

                        return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  updateAnswer(currentQuestion.id, option.id)
                                }
                                className="group w-full rounded-[24px] border border-transparent p-4 text-left transition-all duration-300 transform-gpu hover:-translate-y-1 hover:border-[rgba(16,185,129,0.22)] hover:shadow-[0_22px_38px_-24px_rgba(6,78,59,0.28)]"
                                style={{
                                  background: checked
                                ? currentSurvey.softAccent
                                : "rgba(255,255,255,0.9)",
                                  borderColor: checked
                                ? `${currentSurvey.accent}33`
                                : "transparent",
                                  boxShadow: checked
                                ? "0 22px 38px -24px rgba(6,78,59,0.34)"
                                : "0 10px 24px -20px rgba(6,78,59,0.12)",
                                }}
                          >
                            <div className="flex items-center gap-4">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                  style={{
                                    background: checked
                                    ? currentSurvey.accent
                                    : "rgba(236,253,245,0.75)",
                                  color: checked
                                    ? "white"
                                    : currentSurvey.accent,
                                  }}
                                >
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-[15px] font-semibold leading-6"
                                  style={{ color: "var(--mevi-text-primary)" }}
                                >
                                  {option.label}
                                </p>
                                {option.description && (
                                  <p
                                    className="mt-1 text-sm leading-6"
                                    style={{
                                      color: "var(--mevi-text-muted)",
                                    }}
                                  >
                                    {option.description}
                                  </p>
                                )}
                              </div>
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full border"
                                style={{
                                  borderColor: checked
                                    ? currentSurvey.accent
                                    : "var(--mevi-border)",
                                  background: checked
                                    ? currentSurvey.accent
                                    : "white",
                                }}
                              >
                                {checked && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === "multiple_choice" && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => {
                        const checked = optionIsSelected(
                          getAnswerValue(currentQuestion),
                          option,
                        );

                        return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  toggleMultiChoice(currentQuestion.id, option.id)
                                }
                                className="group w-full rounded-[24px] border border-transparent p-4 text-left transition-all duration-300 transform-gpu hover:-translate-y-1 hover:border-[rgba(16,185,129,0.22)] hover:shadow-[0_22px_38px_-24px_rgba(6,78,59,0.28)]"
                                style={{
                                  background: checked
                                ? currentSurvey.softAccent
                                : "rgba(255,255,255,0.9)",
                                  borderColor: checked
                                ? `${currentSurvey.accent}33`
                                : "transparent",
                                  boxShadow: checked
                                ? "0 22px 38px -24px rgba(6,78,59,0.34)"
                                : "0 10px 24px -20px rgba(6,78,59,0.12)",
                                }}
                          >
                            <div className="flex items-center gap-4">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                  style={{
                                    background: checked
                                    ? currentSurvey.accent
                                    : "rgba(236,253,245,0.75)",
                                  color: checked
                                    ? "white"
                                    : currentSurvey.accent,
                                  }}
                                >
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-[15px] font-semibold leading-6"
                                  style={{ color: "var(--mevi-text-primary)" }}
                                >
                                  {option.label}
                                </p>
                                {option.description && (
                                  <p
                                    className="mt-1 text-sm leading-6"
                                    style={{
                                      color: "var(--mevi-text-muted)",
                                    }}
                                  >
                                    {option.description}
                                  </p>
                                )}
                              </div>
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-md border text-white"
                                style={{
                                  borderColor: checked
                                    ? currentSurvey.accent
                                    : "var(--mevi-border)",
                                  background: checked
                                    ? currentSurvey.accent
                                    : "white",
                                }}
                              >
                                {checked && (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === "rating" && (
                    <div className="space-y-3">
                      {(currentQuestion.options ?? []).map((option, index) => {
                        const checked = optionIsSelected(
                          getAnswerValue(currentQuestion),
                          option,
                        );

                        return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  updateAnswer(currentQuestion.id, option.id)
                                }
                                className="group w-full rounded-[24px] border border-transparent px-4 py-4 text-left transition-all duration-300 transform-gpu hover:-translate-y-1 hover:border-[rgba(16,185,129,0.22)] hover:shadow-[0_22px_38px_-24px_rgba(6,78,59,0.28)]"
                                style={{
                                  color: checked
                                    ? "white"
                                    : "var(--mevi-text-primary)",
                                  background: checked
                                ? currentSurvey.accent
                                : "rgba(255,255,255,0.9)",
                                  borderColor: checked
                                ? `${currentSurvey.accent}33`
                                : "transparent",
                                  boxShadow: checked
                                ? "0 22px 38px -24px rgba(6,78,59,0.34)"
                                : "0 10px 24px -20px rgba(6,78,59,0.12)",
                                }}
                          >
                            <div className="flex items-center gap-4">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                  style={{
                                    background: checked
                                    ? "rgba(255,255,255,0.18)"
                                    : currentSurvey.softAccent,
                                  color: checked
                                    ? "white"
                                    : currentSurvey.accent,
                                  }}
                                >
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-semibold leading-6">
                                  {option.label}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <div
                        className="flex items-center justify-between text-xs"
                        style={{ color: "var(--mevi-text-muted)" }}
                      >
                        <span>{currentQuestion.ratingMinLabel || "Thấp"}</span>
                        <span>{currentQuestion.ratingMaxLabel || "Cao"}</span>
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === "yes_no" && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => {
                        const checked =
                          typeof getAnswerValue(currentQuestion) === "boolean"
                            ? option.id ===
                              ((getAnswerValue(currentQuestion) as boolean)
                                ? 1
                                : 0)
                            : optionIsSelected(
                                getAnswerValue(currentQuestion),
                                option,
                              );

                        return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  updateAnswer(currentQuestion.id, option.id === 1)
                                }
                                className="group w-full rounded-[24px] border border-transparent p-4 text-left transition-all duration-300 transform-gpu hover:-translate-y-1 hover:border-[rgba(16,185,129,0.22)] hover:shadow-[0_22px_38px_-24px_rgba(6,78,59,0.28)]"
                                style={{
                                  background: checked
                                ? currentSurvey.softAccent
                                : "rgba(255,255,255,0.9)",
                                  borderColor: checked
                                ? `${currentSurvey.accent}33`
                                : "transparent",
                                  boxShadow: checked
                                ? "0 22px 38px -24px rgba(6,78,59,0.34)"
                                : "0 10px 24px -20px rgba(6,78,59,0.12)",
                                }}
                          >
                            <div className="flex items-center gap-4">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                  style={{
                                    background: checked
                                    ? currentSurvey.accent
                                    : "rgba(236,253,245,0.75)",
                                  color: checked
                                    ? "white"
                                    : currentSurvey.accent,
                                  }}
                                >
                                {index + 1}
                              </div>
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                                style={{
                                  background: checked
                                    ? "rgba(255,255,255,0.18)"
                                    : "rgba(236,253,245,0.75)",
                                  color: checked
                                    ? "white"
                                    : currentSurvey.accent,
                                }}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-[15px] font-semibold leading-6"
                                  style={{
                                    color: checked
                                      ? "white"
                                      : "var(--mevi-text-primary)",
                                  }}
                                >
                                  {option.label}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {submitFeedback && (
                  <div
                    className="mt-5 rounded-[22px] border border-[rgba(254,202,202,0.9)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm"
                    style={{ color: "#b91c1c" }}
                  >
                    {submitFeedback}
                  </div>
                )}
              </article>

              <div
                className="flex flex-col gap-4 rounded-[28px] border border-transparent bg-white/78 p-5 shadow-[0_18px_50px_-34px_rgba(6,78,59,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(16,185,129,0.22)] hover:shadow-[0_26px_60px_-30px_rgba(6,78,59,0.24)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    {isLastQuestion ? "Sắp hoàn tất" : "Chọn xong rồi bấm Next"}
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    {isLastQuestion
                      ? "Nhấn Next để gửi toàn bộ câu trả lời và chuyển sang bước tiếp theo."
                      : "Mỗi lần chỉ trả lời một câu, sau đó đi sang câu tiếp theo."}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-[12px] px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md"
                    style={{
                      color: "var(--mevi-text-secondary)",
                      background: "rgba(255,255,255,0.6)",
                    }}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={nextDisabled}
                    className="mevi-btn-primary min-w-40 px-5 disabled:opacity-60"
                  >
                    <span className="flex w-full items-center justify-center gap-2 text-center">
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : isLastQuestion ? (
                        "Hoàn tất"
                      ) : (
                        <>
                          Tiếp tục
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={null}>
      <SurveyPageContent />
    </Suspense>
  );
}
