import {
  edaEndpointUrl,
  REQUEST_TIMEOUT_MS,
  type EDAEndpointKey,
} from '@/config/api';

export interface LabelDistributionItem {
  label: string;
  value: number;
  count: number;
  percentage: number;
}

export interface ToxicityDistribution {
  total_votes: number;
  distribution: LabelDistributionItem[];
}

export interface TweetLevelToxicity extends ToxicityDistribution {
  total_tweets: number;
  tie_count: number;
  no_vote_count: number;
  status_breakdown: {
    status: string;
    count: number;
  }[];
}

export interface ToxicityEDAResponse {
  annotation_level: ToxicityDistribution;
  tweet_level: TweetLevelToxicity;
}

async function fetchEDA<T>(
  endpoint: EDAEndpointKey,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const handleAbort = () => controller.abort();
  signal?.addEventListener('abort', handleAbort);

  try {
    const response = await fetch(edaEndpointUrl(endpoint), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${endpoint}: HTTP ${response.status}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (timedOut) {
      throw new Error(`Request timeout: ${endpoint}`);
    }

    throw error;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', handleAbort);
  }
}

export function getToxicityDistribution(
  signal?: AbortSignal,
): Promise<ToxicityEDAResponse> {
  return fetchEDA<ToxicityEDAResponse>('toxicity', signal);
}