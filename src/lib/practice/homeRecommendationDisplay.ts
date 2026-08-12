import type { Recommendation } from './recommendations';

export function getHomeRecommendationSupport({
  isFirst,
  recommendation,
  recommendationPending,
  recommendedStartingCollectionTitle,
  showFirstTimeManualSelection
}: {
  isFirst: boolean;
  recommendation: Recommendation;
  recommendationPending: boolean;
  recommendedStartingCollectionTitle?: string | null;
  showFirstTimeManualSelection: boolean;
}) {
  if (!isFirst && recommendationPending) {
    return { text: null, preserveSpace: true };
  }

  return {
    text: isFirst
      ? showFirstTimeManualSelection ? recommendation.subtitle : recommendedStartingCollectionTitle
      : recommendation.subtitle,
    preserveSpace: false
  };
}
