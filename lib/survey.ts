export const SURVEY_API_BASE = "https://api.xbest.io/lms-survey-service/v1";
export const SURVEY_MEVI_AUTHORIZATION =
  "Basic bWV2aS1lZHU6YUNjQWNWd1Q2NTY0UHZ2SDhtZGNsWQ==";

export const SURVEY_REQUEST_TYPES = [
  "general",
  "farm",
  "factory",
  "shop",
] as const;

export type SurveyRequestType = (typeof SURVEY_REQUEST_TYPES)[number];
export type SurveyLookupType = "phone" | "email";

export const SURVEY_PERIOD_IDS: Record<SurveyRequestType, number> = {
  general: 396,
  farm: 397,
  factory: 398,
  shop: 399,
};

export type SurveyQuestionType =
  | "essay"
  | "single_choice"
  | "multiple_choice"
  | "rating"
  | "yes_no"
  | "single_choice_matrix"
  | "multi_choice_matrix"
  | "linear_matrix";

export type SurveyOption = {
  id: number;
  label: string;
  description?: string;
  isOther?: boolean | null;
  isRow?: boolean | null;
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
  userId?: string;
  userCode: string;
  userName: string;
  positionName: string;
  departmentName: string;
  email: string;
  surveyPeriodId: number;
  surveyPeriodName: string;
  status?: "not_started" | "submitted" | string;
  submittedAt?: string | null;
  resultQuestions: SurveyQuestion[];
};

type RawApiAnswer = {
  id?: number;
  content?: string;
  sortIndex?: number | null;
  isRow?: boolean | null;
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
  userId?: string;
  userCode?: string;
  userName?: string;
  positionName?: string;
  departmentName?: string;
  email?: string;
  surveyPeriodId?: number;
  surveyPeriodName?: string;
  status?: string;
  submittedAt?: string | null;
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
      answerRowId?: number;
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
    case "select":
    case "single_choice":
    case "radio":
    case "choice":
      return "single_choice";
    case "multi_select":
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
    case "single_choice_matrix":
      return "single_choice_matrix";
    case "multi_choice_matrix":
      return "multi_choice_matrix";
    case "linear_matrix":
      return "linear_matrix";
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
        .sort((left, right) => (left.sortIndex ?? 0) - (right.sortIndex ?? 0))
        .map((answer) => ({
          id: answer.id as number,
          label: answer.content?.trim() || `Lựa chọn ${answer.id}`,
          isOther: answer.isOther ?? false,
          isRow: answer.isRow ?? false,
        }));

      return {
        id: question.id ?? 0,
        code: question.code ?? "",
        content: question.content ?? "",
        helperText: question.note ?? null,
        type: mappedType,
        options:
          mappedType === "essay"
            ? undefined
            : options.length
              ? options
              : undefined,
        ratingMinLabel: question.linearRangeFromLabel ?? null,
        ratingMaxLabel: question.linearRangeToLabel ?? null,
        source: "api",
      };
    },
  );

  return {
    id: data.id ?? 0,
    userId: data.userId,
    userCode: data.userCode ?? "",
    userName: data.userName ?? "",
    positionName: data.positionName ?? "",
    departmentName: data.departmentName ?? "",
    email: data.email ?? "",
    surveyPeriodId: data.surveyPeriodId ?? 0,
    surveyPeriodName: data.surveyPeriodName ?? "",
    status: data.status,
    submittedAt: data.submittedAt ?? null,
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
    case "single_choice_matrix":
    case "multi_choice_matrix":
    case "linear_matrix":
      return [];
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

export function inferSurveyLookupType(value: string): SurveyLookupType {
  return value.includes("@") ? "email" : "phone";
}

export async function fetchSurveyDetail(
  type: SurveyRequestType,
  value: string,
  lookupType: SurveyLookupType = inferSurveyLookupType(value),
): Promise<SurveyResultDetails | null> {
  const apiUrl = new URL(`${SURVEY_API_BASE}/survey-result-mevi/${type}`);
  apiUrl.searchParams.set("type", lookupType);
  apiUrl.searchParams.set(lookupType, value);

  const response = await fetch(apiUrl.toString(), {
    headers: {
      accept: "*/*",
      "accept-language": "vi,en;q=0.9",
      authorization: SURVEY_MEVI_AUTHORIZATION,
    },
    cache: "no-store",
  });
  const payload = normalizeObjectKeys(
    (await response.json()) as RawApiSurveyResponse,
  );

  if (!response.ok) {
    throw new Error(payload.message || "Không tải được khảo sát.");
  }

  return mapApiSurveyResponse(payload);
}

export async function submitSurveyResult(
  surveyPeriodId: number,
  payload: SubmitSurveyPayload,
) {
  const response = await fetch(
    `${SURVEY_API_BASE}/survey-periods/${surveyPeriodId}/results/submit`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: SURVEY_MEVI_AUTHORIZATION,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const responsePayload = normalizeObjectKeys(await response.json());

  if (!response.ok) {
    throw new Error(
      responsePayload.message || "Không hoàn tất được khảo sát.",
    );
  }

  return responsePayload;
}
