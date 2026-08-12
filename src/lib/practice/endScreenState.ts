import type { WordList } from '../../data/wordLists';
import type { InterfaceLanguage, Translate } from '../../i18n';
import { getNormalContinuationRecommendation, getRecommendation, type Recommendation } from './recommendations';
import type { SpelioStorage } from './storage';

export type CompletedSupportPracticeContext = {
  listId: string;
  returnTo: string;
};

export function getEndScreenRecommendation(
  storage: SpelioStorage,
  lists: WordList[],
  hasSessionDifficultWords: boolean,
  t?: Translate,
  interfaceLanguage?: InterfaceLanguage
): Recommendation {
  return hasSessionDifficultWords
    ? getRecommendation(storage, lists, t, interfaceLanguage)
    : getNormalContinuationRecommendation(storage, lists, t, interfaceLanguage);
}

export function getEndScreenProgressSummary(
  progressSummary: string | null | undefined,
  completedSupportPractice: CompletedSupportPracticeContext | null
) {
  return completedSupportPractice ? null : progressSummary ?? null;
}
