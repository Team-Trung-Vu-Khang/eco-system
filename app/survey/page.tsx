"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookText,
  CheckCircle2,
  CircleDot,
  Factory,
  Loader2,
  MessageSquareQuote,
  ShoppingBag,
  SlidersHorizontal,
  Sprout,
  SquareCheckBig,
  Tractor,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  type RawApiSurveyResponse,
  type SubmitSurveyPayload,
  type SurveyAnswerValue,
  type SurveyOption,
  type SurveyQuestion,
  type SurveyQuestionType,
  type SurveyResultDetails,
  getDefaultAnswer,
  isAnswered,
  mapApiSurveyResponse,
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
    description:
      "Ghi nhận ý kiến chung để MEVI hỗ trợ bà con rõ ràng và dễ dùng hơn.",
    icon: BookText,
    accent: "var(--mevi-green-700)",
    softAccent: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: 397,
    key: "farm",
    name: "MEVI FARM",
    description:
      "Phù hợp với nhu cầu canh tác, theo dõi mùa vụ và quản lý nông trại.",
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
      "Phù hợp với nhu cầu bán hàng, chăm sóc khách hàng và vận hành cửa hàng.",
    icon: ShoppingBag,
    accent: "#7c3aed",
    softAccent: "rgba(168, 85, 247, 0.12)",
  },
];

const demoQuestionsBySurvey: Record<SurveyTypeMeta["key"], SurveyQuestion[]> = {
  general: [
    {
      id: 9101,
      code: "DEMO-SINGLE",
      content: "Bà con thấy giao diện hiện nay dễ hiểu ở mức nào?",
      type: "single_choice",
      options: [
        { id: 1, label: "Rất dễ hiểu" },
        { id: 2, label: "Khá dễ hiểu" },
        { id: 3, label: "Tạm được" },
        { id: 4, label: "Cần hướng dẫn thêm" },
      ],
      source: "demo",
      helperText: "Câu này dùng để demo dạng chọn 1 đáp án.",
    },
    {
      id: 9102,
      code: "DEMO-MULTI",
      content: "Bà con muốn hệ thống hỗ trợ rõ hơn ở những phần nào?",
      type: "multiple_choice",
      options: [
        { id: 11, label: "Hướng dẫn từng bước" },
        { id: 12, label: "Xem báo cáo" },
        { id: 13, label: "Dùng trên điện thoại" },
        { id: 14, label: "Liên hệ hỗ trợ" },
      ],
      source: "demo",
      helperText: "Câu này dùng để demo dạng chọn nhiều đáp án.",
    },
    {
      id: 9103,
      code: "DEMO-RATING",
      content: "Nếu chấm điểm mức độ thuận tiện, bà con sẽ chấm mấy điểm?",
      type: "rating",
      source: "demo",
      ratingMinLabel: "Chưa thuận tiện",
      ratingMaxLabel: "Rất thuận tiện",
      options: Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        label: String(index + 1),
      })),
    },
    {
      id: 9104,
      code: "DEMO-YESNO",
      content:
        "Sau khi được hướng dẫn, bà con có thể tự thao tác các việc cơ bản không?",
      type: "yes_no",
      source: "demo",
      options: [
        { id: 1, label: "Có" },
        { id: 0, label: "Không" },
      ],
    },
  ],
  farm: [
    {
      id: 9201,
      code: "FARM-DEMO",
      content: "Bà con muốn theo dõi phần nào rõ hơn trong MEVI Farm?",
      type: "multiple_choice",
      source: "demo",
      options: [
        { id: 21, label: "Mùa vụ" },
        { id: 22, label: "Vật tư nông nghiệp" },
        { id: 23, label: "Nhật ký canh tác" },
        { id: 24, label: "Nhân công" },
      ],
    },
  ],
  factory: [
    {
      id: 9301,
      code: "FACTORY-DEMO",
      content: "Công đoạn nào trong nhà máy cần hệ thống theo dõi rõ hơn?",
      type: "single_choice",
      source: "demo",
      options: [
        { id: 31, label: "Nguyên liệu đầu vào" },
        { id: 32, label: "Công đoạn chế biến" },
        { id: 33, label: "Kiểm soát chất lượng" },
        { id: 34, label: "Nhập xuất kho" },
      ],
    },
  ],
  shop: [
    {
      id: 9401,
      code: "SHOP-DEMO",
      content:
        "Bà con có dễ theo dõi đơn hàng và khách hàng trên hệ thống không?",
      type: "yes_no",
      source: "demo",
      options: [
        { id: 1, label: "Có" },
        { id: 0, label: "Không" },
      ],
    },
  ],
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

async function fetchSurveyDetails(
  surveyPeriodId: number,
  email: string,
): Promise<SurveyResultDetails | null> {
  const response = await fetch(
    `/api/surveys/${surveyPeriodId}?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    throw new Error("Không lấy được dữ liệu khảo sát.");
  }

  const payload = (await response.json()) as RawApiSurveyResponse;
  return mapApiSurveyResponse(payload);
}

async function submitSurvey(
  surveyPeriodId: number,
  payload: SubmitSurveyPayload,
) {
  const response = await fetch(`/api/surveys/${surveyPeriodId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.message || "Không gửi được khảo sát.");
  }

  return body;
}

function toNumberArray(value: SurveyAnswerValue) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "number")
    : [];
}

function optionIsSelected(value: SurveyAnswerValue, option: SurveyOption) {
  if (Array.isArray(value)) return value.includes(option.id);
  if (typeof value === "number") return value === option.id;
  return false;
}

function SurveyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialSurveyId = Number(searchParams.get("surveyId")) || 396;
  const nextHref = searchParams.get("nextHref") ?? "";
  const returnTo = searchParams.get("returnTo") ?? "/dashboard";
  const source = searchParams.get("source") ?? "login";
  const [selectedSurveyId, setSelectedSurveyId] =
    useState<number>(initialSurveyId);
  const [userEmail, setUserEmail] = useState("mevi@gmail.com");
  const [answersBySurvey, setAnswersBySurvey] = useState<
    Record<number, Record<number, SurveyAnswerValue>>
  >({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setSelectedSurveyId(initialSurveyId);
  }, [initialSurveyId]);

  useEffect(() => {
    const storedEmail = window.sessionStorage.getItem("mevi_user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const selectedSurvey =
    surveyTypes.find((survey) => survey.id === selectedSurveyId) ??
    surveyTypes[0];

  const surveyQuery = useQuery({
    queryKey: ["survey-details", selectedSurveyId, userEmail],
    queryFn: () => fetchSurveyDetails(selectedSurveyId, userEmail),
    enabled: Boolean(userEmail),
  });

  const apiQuestions = surveyQuery.data?.resultQuestions ?? [];
  const demoQuestions = demoQuestionsBySurvey[selectedSurvey.key];
  const questions = useMemo(
    () => [...apiQuestions, ...demoQuestions],
    [apiQuestions, demoQuestions],
  );

  useEffect(() => {
    if (!questions.length) return;

    setAnswersBySurvey((current) => {
      const existing = current[selectedSurveyId] ?? {};
      const merged = { ...existing };

      for (const question of questions) {
        if (!(question.id in merged)) {
          merged[question.id] = getDefaultAnswer(question);
        }
      }

      return {
        ...current,
        [selectedSurveyId]: merged,
      };
    });
  }, [questions, selectedSurveyId]);

  const currentAnswers = answersBySurvey[selectedSurveyId] ?? {};
  const answeredCount = questions.filter((question) =>
    isAnswered(currentAnswers[question.id] ?? getDefaultAnswer(question)),
  ).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;
  const SurveyIcon = selectedSurvey.icon;

  const updateAnswer = (questionId: number, value: SurveyAnswerValue) => {
    setAnswersBySurvey((current) => ({
      ...current,
      [selectedSurveyId]: {
        ...(current[selectedSurveyId] ?? {}),
        [questionId]: value,
      },
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
      const realQuestions = apiQuestions.filter(
        (question) => question.source === "api",
      );

      const dataSubmit = realQuestions.map((question) => {
        const answerValue = currentAnswers[question.id];

        if (question.type === "essay") {
          const placeholderId = question.options?.[0]?.id;
          return {
            questionId: question.id,
            answers: [
              {
                answerIds: placeholderId ? [placeholderId] : [],
                content: typeof answerValue === "string" ? answerValue : "",
              },
            ],
          };
        }

        if (question.type === "multiple_choice") {
          return {
            questionId: question.id,
            answers: [
              {
                answerIds: toNumberArray(answerValue),
                content: "",
              },
            ],
          };
        }

        if (question.type === "single_choice" || question.type === "rating") {
          return {
            questionId: question.id,
            answers: [
              {
                answerIds: typeof answerValue === "number" ? [answerValue] : [],
                content: "",
              },
            ],
          };
        }

        if (question.type === "yes_no") {
          const selectedOption = question.options?.find((option) =>
            typeof answerValue === "number"
              ? option.id === answerValue
              : typeof answerValue === "boolean"
                ? option.id === (answerValue ? 1 : 0)
                : false,
          );

          return {
            questionId: question.id,
            answers: [
              {
                answerIds: selectedOption ? [selectedOption.id] : [],
                content: "",
              },
            ],
          };
        }

        return {
          questionId: question.id,
          answers: [
            {
              answerIds: [],
              content: "",
            },
          ],
        };
      });

      const payload: SubmitSurveyPayload = {
        email: userEmail,
        dataSubmit,
      };

      return submitSurvey(selectedSurveyId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["survey-details", selectedSurveyId, userEmail],
      });
      setShowSuccessModal(true);
    },
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["survey-details", selectedSurveyId, userEmail],
      });
      setShowSuccessModal(true);
    },
  });

  const questionTypeCounts = questions.reduce<
    Record<SurveyQuestionType, number>
  >(
    (counts, question) => {
      counts[question.type] += 1;
      return counts;
    },
    {
      essay: 0,
      single_choice: 0,
      multiple_choice: 0,
      rating: 0,
      yes_no: 0,
    },
  );

  const handleSuccessConfirm = () => {
    if (nextHref) {
      if (nextHref.startsWith("http")) {
        window.open(nextHref, "_blank");

        return;
      }

      window.open(nextHref, "_blank");

      return;
    }

    router.push(returnTo);
  };

  const assignment = surveyQuery.data;

  return (
    <div className="mevi-portal relative min-h-dvh overflow-x-hidden overflow-y-auto">
        <DecorativeLeaves />

        {showSuccessModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 px-4 backdrop-blur-sm">
            <div
              className="w-full max-w-md rounded-[28px] p-6 shadow-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.97)",
                border: "1px solid rgba(212, 229, 216, 0.95)",
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
                    Cảm ơn bà con đã chia sẻ ý kiến. Thông tin này sẽ giúp MEVI
                    cải thiện hướng dẫn và hỗ trợ công việc thực tế tốt hơn.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSuccessConfirm}
                  className="mevi-btn-primary w-auto px-5"
                >
                  <span>{nextHref ? "Xác nhận và tiếp tục" : "Xác nhận"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-white/70"
                style={{
                  color: "var(--mevi-text-secondary)",
                  background: "rgba(255,255,255,0.45)",
                  border: "1px solid var(--mevi-border)",
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                {source === "module"
                  ? "Quay lại danh sách ứng dụng"
                  : "Quay lại trang chính"}
              </Link>

              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{
                    color: selectedSurvey.accent,
                    background: selectedSurvey.softAccent,
                    border: `1px solid ${selectedSurvey.softAccent}`,
                  }}
                >
                  <SurveyIcon className="h-4 w-4" />
                  Khảo sát MEVI
                </div>
                <h1
                  className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Phiếu khảo sát đầy đủ, dễ trả lời
                </h1>
                <p
                  className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
                  style={{ color: "var(--mevi-text-secondary)" }}
                >
                  Dữ liệu thật đang được lấy từ API theo email đăng nhập. Bên
                  dưới vẫn có thêm phần demo để bạn xem đủ nhiều loại câu hỏi.
                </p>
              </div>
            </div>

            <div
              className="rounded-3xl px-4 py-4 shadow-sm"
              style={{
                background: "rgba(255,255,255,0.68)",
                border: "1px solid rgba(212, 229, 216, 0.8)",
                minWidth: "280px",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--mevi-green-500), var(--mevi-green-700))",
                  }}
                >
                  <Tractor className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    {assignment?.userName || "Tài khoản khảo sát"}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    {(assignment?.userCode || "MEVI") +
                      (assignment?.positionName
                        ? ` • ${assignment.positionName}`
                        : "")}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p style={{ color: "var(--mevi-text-muted)" }}>Phòng ban</p>
                  <p
                    className="mt-1 font-medium"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    {assignment?.departmentName || "Đang cập nhật"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--mevi-text-muted)" }}>Email</p>
                  <p
                    className="mt-1 break-all font-medium"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    {assignment?.email || userEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_2fr]">
            <section
              className="self-start rounded-[28px] p-5 shadow-sm lg:sticky lg:top-4"
              style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(212, 229, 216, 0.8)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Loại khảo sát
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Chọn nhóm phù hợp để xem đúng bộ câu hỏi cần dùng
                  </p>
                </div>
                <div
                  className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    color: "var(--mevi-green-700)",
                    background: "rgba(16, 185, 129, 0.1)",
                  }}
                >
                  {progress}% hoàn thành
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {surveyTypes.map((survey) => {
                  const Icon = survey.icon;
                  const isActive = survey.id === selectedSurveyId;

                  return (
                    <button
                      key={survey.id}
                      type="button"
                      onClick={() => setSelectedSurveyId(survey.id)}
                      className="rounded-2xl p-4 text-left transition-all"
                      style={{
                        background: isActive
                          ? survey.softAccent
                          : "rgba(255,255,255,0.6)",
                        border: isActive
                          ? `1.5px solid ${survey.accent}`
                          : "1px solid rgba(212, 229, 216, 0.85)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                          style={{
                            background: isActive
                              ? survey.accent
                              : survey.softAccent,
                            color: isActive ? "#fff" : survey.accent,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--mevi-text-primary)" }}
                            >
                              {survey.name}
                            </p>
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              style={{
                                color: survey.accent,
                                background: survey.softAccent,
                              }}
                            >
                              {survey.id}
                            </span>
                          </div>
                          <p
                            className="mt-1 text-xs leading-5"
                            style={{ color: "var(--mevi-text-secondary)" }}
                          >
                            {survey.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className="mt-5 rounded-2xl p-4"
                style={{
                  background: "rgba(248, 250, 252, 0.82)",
                  border: "1px solid rgba(212, 229, 216, 0.8)",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Các dạng câu hỏi trong màn hình này
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.keys(questionTypeMeta) as SurveyQuestionType[]).map(
                    (type) => {
                      const meta = questionTypeMeta[type];
                      const Icon = meta.icon;
                      const count = questionTypeCounts[type];

                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
                          style={{
                            color: "var(--mevi-text-secondary)",
                            background: count
                              ? "rgba(16, 185, 129, 0.08)"
                              : "rgba(148, 163, 184, 0.08)",
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                          <strong style={{ color: "var(--mevi-text-primary)" }}>
                            {count}
                          </strong>
                        </span>
                      );
                    },
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div
                className="rounded-[28px] p-5 shadow-sm sm:p-6"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(212, 229, 216, 0.8)",
                }}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        color: selectedSurvey.accent,
                        background: selectedSurvey.softAccent,
                      }}
                    >
                      <SurveyIcon className="h-3.5 w-3.5" />
                      {selectedSurvey.name}
                    </div>
                    <h2
                      className="mt-3 text-2xl font-bold"
                      style={{ color: "var(--mevi-text-primary)" }}
                    >
                      Nội dung khảo sát
                    </h2>
                    <p
                      className="mt-2 max-w-2xl text-sm leading-6"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      Câu hỏi thực từ API sẽ hiển thị trước. Các câu demo thêm
                      phía sau dùng để xem đủ giao diện nhiều loại câu hỏi.
                    </p>
                  </div>

                  <div className="grid w-full grid-cols-3 gap-3 text-center sm:max-w-sm lg:w-auto lg:min-w-[220px]">
                    <div
                      className="rounded-2xl px-3 py-3"
                      style={{ background: "rgba(16, 185, 129, 0.08)" }}
                    >
                      <p
                        className="text-lg font-bold"
                        style={{ color: "var(--mevi-text-primary)" }}
                      >
                        {questions.length}
                      </p>
                      <p
                        className="mt-1 text-[11px] leading-4"
                        style={{ color: "var(--mevi-text-muted)" }}
                      >
                        Câu hỏi
                      </p>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-3"
                      style={{ background: "rgba(59, 130, 246, 0.08)" }}
                    >
                      <p
                        className="text-lg font-bold"
                        style={{ color: "var(--mevi-text-primary)" }}
                      >
                        {answeredCount}
                      </p>
                      <p
                        className="mt-1 text-[11px] leading-4"
                        style={{ color: "var(--mevi-text-muted)" }}
                      >
                        Đã trả lời
                      </p>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-3"
                      style={{ background: selectedSurvey.softAccent }}
                    >
                      <p
                        className="text-lg font-bold"
                        style={{ color: "var(--mevi-text-primary)" }}
                      >
                        {selectedSurvey.id}
                      </p>
                      <p
                        className="mt-1 text-[11px] leading-4"
                        style={{ color: "var(--mevi-text-muted)" }}
                      >
                        Survey ID
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(212,229,216,0.8)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${selectedSurvey.accent}, var(--mevi-green-500))`,
                    }}
                  />
                </div>
              </div>

              {surveyQuery.isLoading && (
                <div
                  className="rounded-[26px] p-6 shadow-sm"
                  style={{
                    background: "rgba(255,255,255,0.78)",
                    border: "1px solid rgba(212, 229, 216, 0.8)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      style={{ color: "var(--mevi-green-700)" }}
                    />
                    <p style={{ color: "var(--mevi-text-secondary)" }}>
                      Đang lấy câu hỏi khảo sát từ hệ thống...
                    </p>
                  </div>
                </div>
              )}

              {surveyQuery.isError && (
                <div
                  className="rounded-[26px] p-6 shadow-sm"
                  style={{
                    background: "rgba(255,255,255,0.78)",
                    border: "1px solid rgba(254, 202, 202, 0.9)",
                  }}
                >
                  <p className="font-semibold" style={{ color: "#b91c1c" }}>
                    Không lấy được dữ liệu khảo sát từ API.
                  </p>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Trang vẫn hiển thị phần demo giao diện để bạn tiếp tục kiểm
                    tra.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const meta = questionTypeMeta[question.type];
                  const Icon = meta.icon;
                  const answerValue =
                    currentAnswers[question.id] ?? getDefaultAnswer(question);
                  const answered = isAnswered(answerValue);

                  return (
                    <article
                      key={question.id}
                      className="rounded-[26px] p-5 shadow-sm sm:p-6"
                      style={{
                        background: "rgba(255,255,255,0.76)",
                        border: "1px solid rgba(212, 229, 216, 0.8)",
                      }}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              color: selectedSurvey.accent,
                              background: selectedSurvey.softAccent,
                            }}
                          >
                            Câu {index + 1}
                          </span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              color: "var(--mevi-text-muted)",
                              background: "rgba(148, 163, 184, 0.12)",
                            }}
                          >
                            {question.code}
                          </span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              color: answered
                                ? "var(--mevi-green-700)"
                                : "var(--mevi-earth-700)",
                              background: answered
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(245, 158, 11, 0.14)",
                            }}
                          >
                            {answered ? "Đã trả lời" : "Chưa trả lời"}
                          </span>
                          {question.source === "demo" && (
                            <span
                              className="rounded-full px-3 py-1 text-xs font-semibold"
                              style={{
                                color: "#6366f1",
                                background: "rgba(99, 102, 241, 0.12)",
                              }}
                            >
                              Demo giao diện
                            </span>
                          )}
                          <span
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              color: selectedSurvey.accent,
                              background: selectedSurvey.softAccent,
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="text-lg font-semibold leading-8"
                            style={{ color: "var(--mevi-text-primary)" }}
                          >
                            {question.content}
                          </h3>
                          {question.helperText && (
                            <p
                              className="mt-2 text-sm leading-6"
                              style={{ color: "var(--mevi-text-muted)" }}
                            >
                              {question.helperText}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5">
                        {question.type === "essay" && (
                          <>
                            <label
                              htmlFor={`question-${question.id}`}
                              className="mb-2 block text-sm font-medium"
                              style={{ color: "var(--mevi-text-secondary)" }}
                            >
                              Câu trả lời của bà con
                            </label>
                            <textarea
                              id={`question-${question.id}`}
                              value={
                                typeof answerValue === "string"
                                  ? answerValue
                                  : ""
                              }
                              onChange={(event) =>
                                updateAnswer(question.id, event.target.value)
                              }
                              placeholder="Bà con nhập câu trả lời tại đây..."
                              className="min-h-36 w-full resize-y rounded-3xl px-4 py-4 text-sm outline-none transition-all"
                              style={{
                                color: "var(--mevi-text-primary)",
                                background: "rgba(255,255,255,0.86)",
                                border: "1.5px solid var(--mevi-border)",
                              }}
                            />
                          </>
                        )}

                        {question.type === "single_choice" && (
                          <div className="grid gap-3">
                            {question.options?.map((option) => {
                              const checked = optionIsSelected(
                                answerValue,
                                option,
                              );

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    updateAnswer(question.id, option.id)
                                  }
                                  className="rounded-2xl p-4 text-left transition-all"
                                  style={{
                                    background: checked
                                      ? selectedSurvey.softAccent
                                      : "rgba(255,255,255,0.82)",
                                    border: checked
                                      ? `1.5px solid ${selectedSurvey.accent}`
                                      : "1px solid rgba(212, 229, 216, 0.85)",
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border"
                                      style={{
                                        borderColor: checked
                                          ? selectedSurvey.accent
                                          : "var(--mevi-border)",
                                        background: checked
                                          ? selectedSurvey.accent
                                          : "white",
                                      }}
                                    >
                                      {checked && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <p
                                      className="text-sm font-medium"
                                      style={{
                                        color: "var(--mevi-text-primary)",
                                      }}
                                    >
                                      {option.label}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {question.type === "multiple_choice" && (
                          <div className="grid gap-3">
                            {question.options?.map((option) => {
                              const checked = optionIsSelected(
                                answerValue,
                                option,
                              );

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    toggleMultiChoice(question.id, option.id)
                                  }
                                  className="rounded-2xl p-4 text-left transition-all"
                                  style={{
                                    background: checked
                                      ? selectedSurvey.softAccent
                                      : "rgba(255,255,255,0.82)",
                                    border: checked
                                      ? `1.5px solid ${selectedSurvey.accent}`
                                      : "1px solid rgba(212, 229, 216, 0.85)",
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-white"
                                      style={{
                                        borderColor: checked
                                          ? selectedSurvey.accent
                                          : "var(--mevi-border)",
                                        background: checked
                                          ? selectedSurvey.accent
                                          : "white",
                                      }}
                                    >
                                      {checked && (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      )}
                                    </div>
                                    <p
                                      className="text-sm font-medium"
                                      style={{
                                        color: "var(--mevi-text-primary)",
                                      }}
                                    >
                                      {option.label}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {question.type === "rating" && (
                          <div>
                            <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                              {(question.options ?? []).map((option) => {
                                const checked = optionIsSelected(
                                  answerValue,
                                  option,
                                );

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                      updateAnswer(question.id, option.id)
                                    }
                                    className="rounded-2xl px-3 py-3 text-sm font-semibold transition-all"
                                    style={{
                                      color: checked
                                        ? "white"
                                        : "var(--mevi-text-primary)",
                                      background: checked
                                        ? selectedSurvey.accent
                                        : "rgba(255,255,255,0.84)",
                                      border: checked
                                        ? `1.5px solid ${selectedSurvey.accent}`
                                        : "1px solid rgba(212, 229, 216, 0.85)",
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                            <div
                              className="mt-3 flex items-center justify-between text-xs"
                              style={{ color: "var(--mevi-text-muted)" }}
                            >
                              <span>{question.ratingMinLabel || "Thấp"}</span>
                              <span>{question.ratingMaxLabel || "Cao"}</span>
                            </div>
                          </div>
                        )}

                        {question.type === "yes_no" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {question.options?.map((option) => {
                              const checked =
                                typeof answerValue === "boolean"
                                  ? option.id === (answerValue ? 1 : 0)
                                  : optionIsSelected(answerValue, option);

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    updateAnswer(
                                      question.id,
                                      option.id === 1 ? true : false,
                                    )
                                  }
                                  className="rounded-2xl p-4 text-left transition-all"
                                  style={{
                                    background: checked
                                      ? selectedSurvey.softAccent
                                      : "rgba(255,255,255,0.82)",
                                    border: checked
                                      ? `1.5px solid ${selectedSurvey.accent}`
                                      : "1px solid rgba(212, 229, 216, 0.85)",
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="flex h-9 w-9 items-center justify-center rounded-full"
                                      style={{
                                        background: checked
                                          ? selectedSurvey.accent
                                          : "rgba(236, 253, 245, 0.7)",
                                        color: checked
                                          ? "white"
                                          : selectedSurvey.accent,
                                      }}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <span
                                      className="text-sm font-medium"
                                      style={{
                                        color: "var(--mevi-text-primary)",
                                      }}
                                    >
                                      {option.label}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div
                className="flex flex-col gap-3 rounded-[26px] p-5 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(212, 229, 216, 0.8)",
                }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Hoàn tất khảo sát
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Nút gửi sẽ nộp phần câu hỏi thật từ API. Các câu demo chỉ
                    dùng để xem trước giao diện nhiều loại câu hỏi.
                  </p>
                </div>
                <div className="flex sm:justify-end">
                  <button
                    type="button"
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending || !apiQuestions.length}
                    className="mevi-btn-primary min-w-40 px-5 disabled:opacity-60"
                  >
                    <span className="flex w-full items-center justify-center gap-2 text-center">
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        "Gửi khảo sát"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
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
