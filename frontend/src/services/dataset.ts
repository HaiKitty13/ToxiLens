
import {
  edaEndpointUrl,
  REQUEST_TIMEOUT_MS,
  type EDAEndpointKey,
} from '@/config/api';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface LabelDistributionItem {
  label: string;
  value: number;
  count: number;
  percentage: number;
}

export interface ToxicityEDAResponse {
  annotation_level: {
    total_votes: number;
    distribution: LabelDistributionItem[];
  };
  tweet_level: {
    total_tweets: number;
    distribution: LabelDistributionItem[];
    tie_count: number;
    no_vote_count: number;
    status_breakdown: {
      status: string;
      count: number;
    }[];
  };
}

export interface CategoryDistributionItem {
  category: string;
  annotation_level: {
    positive: number;
    total: number;
    percentage: number;
  };
  tweet_level: {
    positive: number;
    total: number;
    percentage: number;
  };
}

export interface CategoriesEDAResponse {
  categories: CategoryDistributionItem[];
  flags: CategoryDistributionItem[];
}

export interface DatasetVisualizationData {
  toxicity: ToxicityEDAResponse;
  categories: CategoriesEDAResponse;
}

type JsonRecord = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function asRecord(value: unknown): JsonRecord {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as JsonRecord;
  }

  return {};
}

function getNumber(
  record: JsonRecord,
  keys: string[],
): number {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return 0;
}

function getArray(
  record: JsonRecord,
  key: string,
): unknown[] {
  const value = record[key];

  return Array.isArray(value) ? value : [];
}

/* -------------------------------------------------------------------------- */
/* Toxicity Normalization                                                     */
/* -------------------------------------------------------------------------- */

function normalizeLabelDistribution(
  value: unknown,
): LabelDistributionItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const record = asRecord(item);

    return {
      label: String(record.label ?? 'Unknown'),
      value: getNumber(record, ['value']),
      count: getNumber(record, ['count']),
      percentage: getNumber(record, ['percentage']),
    };
  });
}

function normalizeToxicityResponse(
  response: unknown,
): ToxicityEDAResponse {
  const body = asRecord(response);

  const annotationLevel = asRecord(
    body.annotation_level,
  );

  const tweetLevel = asRecord(body.tweet_level);

  const statusBreakdown = getArray(
    tweetLevel,
    'status_breakdown',
  ).map((item) => {
    const record = asRecord(item);

    return {
      status: String(record.status ?? 'Unknown'),
      count: getNumber(record, ['count']),
    };
  });

  return {
    annotation_level: {
      total_votes: getNumber(annotationLevel, [
        'total_votes',
      ]),
      distribution: normalizeLabelDistribution(
        annotationLevel.distribution,
      ),
    },

    tweet_level: {
      total_tweets: getNumber(tweetLevel, [
        'total_tweets',
      ]),
      distribution: normalizeLabelDistribution(
        tweetLevel.distribution,
      ),
      tie_count: getNumber(tweetLevel, [
        'tie_count',
      ]),
      no_vote_count: getNumber(tweetLevel, [
        'no_vote_count',
      ]),
      status_breakdown: statusBreakdown,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Category Normalization                                                     */
/* -------------------------------------------------------------------------- */

function normalizeCategoryDistribution(
  value: unknown,
): CategoryDistributionItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const record = asRecord(item);

    const annotationLevel = asRecord(
      record.annotation_level,
    );

    const tweetLevel = asRecord(record.tweet_level);

    return {
      category: String(
        record.category ?? 'Unknown',
      ),

      annotation_level: {
        positive: getNumber(annotationLevel, [
          'positive',
        ]),
        total: getNumber(annotationLevel, [
          'total',
        ]),
        percentage: getNumber(annotationLevel, [
          'percentage',
        ]),
      },

      tweet_level: {
        positive: getNumber(tweetLevel, [
          'positive',
        ]),
        total: getNumber(tweetLevel, [
          'total',
        ]),
        percentage: getNumber(tweetLevel, [
          'percentage',
        ]),
      },
    };
  });
}

function normalizeCategoriesResponse(
  response: unknown,
): CategoriesEDAResponse {
  const body = asRecord(response);

  return {
    categories: normalizeCategoryDistribution(
      body.categories,
    ),

    flags: normalizeCategoryDistribution(
      body.flags,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* HTTP Request                                                               */
/* -------------------------------------------------------------------------- */

async function fetchEDAEndpoint<T>(
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
    if (signal?.aborted) {
      controller.abort();
    }

    const response = await fetch(
      edaEndpointUrl(endpoint),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);

      const detail =
        body &&
        typeof body === 'object' &&
        'detail' in body
          ? String(body.detail)
          : `HTTP ${response.status}`;

      throw new Error(detail);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (timedOut) {
      throw new Error(
        `Request timeout while fetching ${endpoint}.`,
      );
    }

    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw error;
    }

    throw error;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', handleAbort);
  }
}

/* -------------------------------------------------------------------------- */
/* Public Service                                                             */
/* -------------------------------------------------------------------------- */

export async function getDatasetVisualizations(
  signal?: AbortSignal,
): Promise<DatasetVisualizationData> {
  const [toxicityResponse, categoriesResponse] =
    await Promise.all([
      fetchEDAEndpoint<unknown>('toxicity', signal),
      fetchEDAEndpoint<unknown>('categories', signal),
    ]);

  return {
    toxicity: normalizeToxicityResponse(
      toxicityResponse,
    ),

    categories: normalizeCategoriesResponse(
      categoriesResponse,
    ),
  };
}
