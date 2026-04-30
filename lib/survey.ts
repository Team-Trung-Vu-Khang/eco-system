export const SURVEY_API_BASE = "https://api.xbest.io/lms-survey-service/v1";
export const SURVEY_API_ORIGIN = "https://mevi.edtexco.vn";

export type SurveyQuestionType =
  | "essay"
  | "single_choice"
  | "multiple_choice"
  | "rating"
  | "yes_no";

export type SurveyOption = {
  id: number;
  label: string;
  description?: string;
  isOther?: boolean | null;
};

export type SurveyQuestion = {
  id: number;
  code: string;
  content: string;
  helperText?: string | null;
  type: SurveyQuestionType;
  required?: boolean;
  options?: SurveyOption[];
  ratingMinLabel?: string | null;
  ratingMaxLabel?: string | null;
  source: "api" | "demo";
};

export type SurveyAnswerValue = string | number[] | number | boolean | null;

export type SurveyResultDetails = {
  id: number;
  userCode: string;
  userName: string;
  positionName: string;
  departmentName: string;
  email: string;
  surveyPeriodId: number;
  surveyPeriodName: string;
  resultQuestions: SurveyQuestion[];
};

type RawApiAnswer = {
  id?: number;
  content?: string;
  isOther?: boolean | null;
};

type RawApiQuestion = {
  id?: number;
  code?: string;
  content?: string;
  note?: string | null;
  type?: string;
  linearRangeFromLabel?: string | null;
  linearRangeToLabel?: string | null;
  answers?: RawApiAnswer[];
};

type RawApiSurveyData = {
  id?: number;
  userCode?: string;
  userName?: string;
  positionName?: string;
  departmentName?: string;
  email?: string;
  surveyPeriodId?: number;
  surveyPeriodName?: string;
  resultQuestions?: RawApiQuestion[];
};

export type RawApiSurveyResponse = {
  code?: number;
  message?: string;
  data?: RawApiSurveyData;
};

export type SubmitSurveyPayload = {
  email: string;
  dataSubmit: Array<{
    questionId: number;
    answers: Array<{
      answerIds: number[];
      content: string;
    }>;
  }>;
};

export function normalizeObjectKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeObjectKeys(item)) as T;
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.endsWith(":") ? key.slice(0, -1) : key,
        normalizeObjectKeys(value),
      ]),
    ) as T;
  }

  return input;
}

export function mapApiQuestionType(type?: string): SurveyQuestionType {
  switch (type) {
    case "essay":
      return "essay";
    case "single_choice":
    case "radio":
    case "choice":
      return "single_choice";
    case "multiple_choice":
    case "checkbox":
      return "multiple_choice";
    case "linear_range":
    case "rating":
    case "scale":
      return "rating";
    case "yes_no":
    case "boolean":
      return "yes_no";
    default:
      return "essay";
  }
}

export function mapApiSurveyResponse(
  payload: RawApiSurveyResponse,
): SurveyResultDetails | null {
  const normalized = normalizeObjectKeys(payload);
  const data = normalized.data;

  if (!data) return null;

  const mappedQuestions: SurveyQuestion[] = (data.resultQuestions ?? []).map(
    (question) => {
      const mappedType = mapApiQuestionType(question.type);
      const options = (question.answers ?? [])
        .filter((answer) => typeof answer.id === "number")
        .map((answer) => ({
          id: answer.id as number,
          label: answer.content?.trim() || `Lựa chọn ${answer.id}`,
          isOther: answer.isOther ?? false,
        }));

      return {
        id: question.id ?? 0,
        code: question.code ?? "",
        content: question.content ?? "",
        helperText: question.note ?? null,
        type: mappedType,
        options:
          mappedType === "essay" ? undefined : options.length ? options : undefined,
        ratingMinLabel: question.linearRangeFromLabel ?? null,
        ratingMaxLabel: question.linearRangeToLabel ?? null,
        source: "api",
      };
    },
  );

  return {
    id: data.id ?? 0,
    userCode: data.userCode ?? "",
    userName: data.userName ?? "",
    positionName: data.positionName ?? "",
    departmentName: data.departmentName ?? "",
    email: data.email ?? "",
    surveyPeriodId: data.surveyPeriodId ?? 0,
    surveyPeriodName: data.surveyPeriodName ?? "",
    resultQuestions: mappedQuestions,
  };
}

export function getDefaultAnswer(question: SurveyQuestion): SurveyAnswerValue {
  switch (question.type) {
    case "essay":
      return "";
    case "single_choice":
    case "rating":
      return null;
    case "multiple_choice":
      return [];
    case "yes_no":
      return null;
    default:
      return "";
  }
}

export function isAnswered(value: SurveyAnswerValue) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  return false;
}
