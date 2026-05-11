import {
  BRANCH_QUESTION_CODE,
  BRANCH_QUESTION_CONTENT,
} from "@/features/survey/constants/survey.constants";
import {
  type MatrixSurveyAnswerValue,
  type SurveyAnswerValue,
  type SurveyLookupType,
  type SurveyQuestion,
  type SurveyRequestType,
  inferSurveyLookupType,
} from "@/features/survey/api";

export function isBranchQuestion(question?: SurveyQuestion | null) {
  if (!question) return false;

  return (
    question.code === BRANCH_QUESTION_CODE ||
    question.content
      .toLocaleLowerCase("vi")
      .includes(BRANCH_QUESTION_CONTENT.toLocaleLowerCase("vi"))
  );
}

export function getBranchSurveyType(
  question: SurveyQuestion | undefined,
  value: SurveyAnswerValue,
): SurveyRequestType | null {
  return getBranchSurveyTypes(question, value)[0] ?? null;
}

export function getBranchSurveyTypes(
  question: SurveyQuestion | undefined,
  value: SurveyAnswerValue,
): SurveyRequestType[] {
  if (!question || !isBranchQuestion(question)) return [];

  const selectedOptionIds =
    typeof value === "number" ? [value] : Array.isArray(value) ? value : [];
  const selectedSurveyTypes = new Set<SurveyRequestType>();

  selectedOptionIds.forEach((optionId) => {
    const selectedOption = question.options?.find(
      (option) => option.id === optionId,
    );
    const selectedLabel = selectedOption?.label.toLocaleUpperCase("vi") ?? "";

    if (selectedLabel.includes("MEVI FARM")) selectedSurveyTypes.add("farm");
    if (selectedLabel.includes("MEVI FACTORY")) {
      selectedSurveyTypes.add("factory");
    }
    if (selectedLabel.includes("MEVI SHOP")) selectedSurveyTypes.add("shop");
  });

  return (["farm", "factory", "shop"] as const).filter((surveyType) =>
    selectedSurveyTypes.has(surveyType),
  );
}

export function getStoredLookupType(value: string): SurveyLookupType {
  if (typeof window === "undefined") return inferSurveyLookupType(value);

  const storedType = window.sessionStorage.getItem("mevi_user_lookup_type");
  if (
    storedType === "phone" ||
    storedType === "email" ||
    storedType === "code" ||
    storedType === "userId"
  ) {
    return storedType;
  }

  return inferSurveyLookupType(value);
}

export function getInitialSurveyType(value: string | null): SurveyRequestType {
  const surveyType = value?.trim();

  if (
    surveyType === "general" ||
    surveyType === "farm" ||
    surveyType === "factory" ||
    surveyType === "shop"
  ) {
    return surveyType;
  }

  return "general";
}

export function isMatrixAnswerValue(
  value: SurveyAnswerValue,
): value is MatrixSurveyAnswerValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function getMatrixParts(question: SurveyQuestion) {
  const options = question.options ?? [];

  return {
    columns: options.filter((option) => !option.isRow),
    rows: options.filter((option) => option.isRow),
  };
}
