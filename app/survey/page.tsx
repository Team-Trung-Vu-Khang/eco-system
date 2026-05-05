"use client";

import { useMutation, useQueries } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { DecorativeLeaves } from "./components/decorative-leaves";
import { SurveyPortalHeader } from "./components/survey-portal-header";
import { SurveySuccessModal } from "./components/survey-success-modal";
import {
  GENERAL_SURVEY_ID,
  INTRO_USER_QUESTION_ID,
  demoSurveyDetails,
  introQuestions,
  questionTypeMeta,
  surveyTypes,
} from "./data";
import { optionIsSelected } from "./utils";
import {
  type SubmitSurveyPayload,
  type SurveyAnswerValue,
  type SurveyQuestion,
  type SurveyResultDetails,
  fetchSurveyDetail,
  getDefaultAnswer,
  isAnswered,
  submitSurveyResult,
} from "@/lib/survey";

type SurveyQuestionWithMeta = SurveyQuestion & {
  surveyPeriodId?: number;
  surveyPeriodName?: string;
  originalQuestionId?: number;
};

function buildSubmitPayload(
  questions: SurveyQuestion[],
  answersByQuestion: Record<number, SurveyAnswerValue>,
): SubmitSurveyPayload["dataSubmit"] {
  return questions
    .map((question) => {
      const value = answersByQuestion[question.id] ?? getDefaultAnswer(question);

      if (!isAnswered(value)) return null;

      if (question.type === "essay" && typeof value === "string") {
        const answerIds = (question.options ?? []).map((option) => option.id);
        return {
          questionId: question.id,
          answers: [
            {
              answerIds,
              content: value.trim(),
            },
          ],
        };
      }

      if (question.type === "multiple_choice" && Array.isArray(value)) {
        return {
          questionId: question.id,
          answers: [
            {
              answerIds: value,
              content: "",
            },
          ],
        };
      }

      if (
        (question.type === "single_choice" || question.type === "rating") &&
        typeof value === "number"
      ) {
        const option = question.options?.find((item) => item.id === value);
        return {
          questionId: question.id,
          answers: [
            {
              answerIds: [value],
              content: option?.isOther ? option.label : "",
            },
          ],
        };
      }

      if (question.type === "yes_no" && typeof value === "boolean") {
        const answerId = value ? 1 : 0;
        const option = question.options?.find((item) => item.id === answerId);
        return {
          questionId: question.id,
          answers: [
            {
              answerIds: [answerId],
              content: option?.isOther ? option.label : "",
            },
          ],
        };
      }

      return null;
    })
    .filter(
      (item): item is SubmitSurveyPayload["dataSubmit"][number] =>
        Boolean(item),
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
  const [userEmail] = useState(() => {
    if (typeof window === "undefined") return "mevi@gmail.com";
    return window.sessionStorage.getItem("mevi_user_email") ?? "mevi@gmail.com";
  });

  const selectedIntroValue = answersByQuestion[INTRO_USER_QUESTION_ID];

  const selectedSurveyIds = useMemo(() => {
    const selectedValue = selectedIntroValue;

    if (Array.isArray(selectedValue) && selectedValue.length > 0) {
      return [
        GENERAL_SURVEY_ID,
        ...selectedValue.filter((id) => id !== GENERAL_SURVEY_ID),
      ];
    }

    return [GENERAL_SURVEY_ID];
  }, [selectedIntroValue]);

  const selectedSurveyKeys = useMemo(
    () =>
      selectedSurveyIds
        .map((surveyPeriodId) =>
          surveyTypes.find((survey) => survey.id === surveyPeriodId),
        )
        .filter((survey): survey is (typeof surveyTypes)[number] =>
          Boolean(survey),
        ),
    [selectedSurveyIds],
  );

  const surveyQueries = useQueries({
    queries: selectedSurveyKeys.map((survey) => ({
      queryKey: ["survey-detail", survey.key, userEmail],
      queryFn: () => fetchSurveyDetail(survey.key, userEmail),
      enabled: Boolean(userEmail),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const apiSurveyDetails = useMemo(
    () =>
      Object.fromEntries(
        surveyQueries
          .map((query, index) => [selectedSurveyKeys[index]?.id, query.data])
          .filter(
            (entry): entry is [number, SurveyResultDetails] =>
              typeof entry[0] === "number" && Boolean(entry[1]),
          ),
      ),
    [selectedSurveyKeys, surveyQueries],
  );

  const isLoadingSurveys = surveyQueries.some((query) => query.isLoading);
  const surveyLoadError = surveyQueries.find((query) => query.isError)?.error;
  const surveyLoadFeedback =
    surveyLoadError instanceof Error ? surveyLoadError.message : null;
  const visibleFeedback = submitFeedback ?? surveyLoadFeedback;

  const surveyDetails = selectedSurveyIds
    .map(
      (surveyPeriodId) =>
        apiSurveyDetails[surveyPeriodId] ?? demoSurveyDetails[surveyPeriodId],
    )
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
    currentQuestion && currentQuestion.surveyPeriodId
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
      const submitTargets = surveyDetails.filter(
        (surveyDetail) =>
          apiSurveyDetails[surveyDetail.surveyPeriodId] &&
          surveyDetail.resultQuestions.some((question) =>
            isAnswered(getAnswerValue(question)),
          ),
      );

      await Promise.all(
        submitTargets.map((surveyDetail) =>
          submitSurveyResult(surveyDetail.surveyPeriodId, {
            email: userEmail,
            dataSubmit: buildSubmitPayload(
              surveyDetail.resultQuestions,
              answersByQuestion,
            ),
          }),
        ),
      );

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
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28 sm:pb-32">
        <SurveyPortalHeader title={portalTitle} accent={currentSurvey.accent} />

        {showSuccessModal && (
          <SurveySuccessModal
            onGoHome={() => {
              if (!completionTarget) return;

              if (completionTarget.startsWith("http")) {
                window.location.assign(completionTarget);
                return;
              }

              router.push(completionTarget);
            }}
          />
        )}

        <main className="flex-1 px-4 pb-5 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
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
                      {isLoadingSurveys
                        ? "Đang đồng bộ API khảo sát..."
                        : `${answeredCount} câu đã trả lời`}
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

                {visibleFeedback && (
                  <div
                    className="mt-5 rounded-[22px] border border-[rgba(254,202,202,0.9)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm"
                    style={{ color: "#b91c1c" }}
                  >
                    {visibleFeedback}
                  </div>
                )}
              </article>

              <div className="flex flex-col gap-4 rounded-[28px] border border-transparent bg-white/78 p-5 shadow-[0_18px_50px_-34px_rgba(6,78,59,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(16,185,129,0.22)] hover:shadow-[0_26px_60px_-30px_rgba(6,78,59,0.24)] sm:flex-row sm:items-center sm:justify-between">
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
      </div>

      <MeviPortalFooter />
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
