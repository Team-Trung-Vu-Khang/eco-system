import { useMutation } from "@tanstack/react-query";
import {
  fetchSurveyDetail,
  type SurveyLookupType,
  type SurveyRequestContext,
  type SurveyRequestType,
} from "@/features/survey/api";

type SurveyDetailMutationVariables = {
  type: SurveyRequestType;
  value: string;
  lookupType: SurveyLookupType;
  context?: SurveyRequestContext;
};

export function useSurveyDetailMutation() {
  return useMutation({
    mutationFn: ({
      type,
      value,
      lookupType,
      context,
    }: SurveyDetailMutationVariables) =>
      fetchSurveyDetail(type, value, lookupType, context),
  });
}
