import { useQuery } from "@tanstack/react-query";
import { fetchPublishedFeatures, selectLatestFeature, type PublishedFeature } from "@/lib/btyPublishedFeatures";

export const LATEST_BTY_FEATURE_QUERY_KEY = ["bty-published-features", "latest"] as const;

/** Shared cached query for the newest valid published BTY feature (homepage + BTY page). */
export function useLatestPublishedFeature() {
  return useQuery<PublishedFeature | null>({
    queryKey: LATEST_BTY_FEATURE_QUERY_KEY,
    queryFn: async () => selectLatestFeature(await fetchPublishedFeatures()),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
