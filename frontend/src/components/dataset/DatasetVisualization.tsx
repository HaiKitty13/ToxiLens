
import { BarChartCard } from '@/components/charts/BarChartCard';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { Card } from '@/components/ui/Card';
import { PlaceholderBadge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/PageHeader';

import { useDatasetVisualizations } from '@/hooks/useDatasetVisualization';
import { humanize } from '@/lib/utils';

function LoadingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2].map((item) => (
        <Card
          key={item}
          className="h-80 animate-pulse bg-muted/40"
        />
      ))}
    </div>
  );
}

function EmptyChart({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
      <PlaceholderBadge>Data Unavailable</PlaceholderBadge>

      <h3 className="mt-3 font-semibold">{title}</h3>

      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <Card className="p-6">
      <PlaceholderBadge>Connection Error</PlaceholderBadge>

      <h3 className="mt-3 font-semibold">
        Unable to load dataset visualizations
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Try Again
      </button>
    </Card>
  );
}

export default function DatasetVisualizations() {
  const { data, loading, error, refetch } =
    useDatasetVisualizations();

  if (loading) {
    return (
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Dataset Analytics"
          title="Label distribution"
          description="Distribution of toxicity labels based on majority voting."
        />

        <LoadingCards />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Dataset Analytics"
          title="Label distribution"
          description="Distribution of toxicity labels based on majority voting."
        />

        <ErrorState
          error={error ?? 'Dataset data is unavailable.'}
          onRetry={refetch}
        />
      </section>
    );
  }

  // Stage 1: Binary classification using tweet-level majority vote.
  const toxicityData = data.toxicity.tweet_level.distribution.map(
    (item) => ({
      name: humanize(item.label),
      value: item.count,
    }),
  );

  const toxicItem =
    data.toxicity.tweet_level.distribution.find(
      (item) => item.value === 1,
    );

  const nonToxicItem =
    data.toxicity.tweet_level.distribution.find(
      (item) => item.value === 0,
    );

  const totalValidTweets =
    data.toxicity.tweet_level.distribution.reduce(
      (total, item) => total + item.count,
      0,
    );

  const totalToxicTweets = toxicItem?.count ?? 0;

  // Stage 2: Multi-label categories among toxic tweets only.
  const categoryData = data.categories.categories.map(
    (item) => ({
      name: humanize(item.category),
      value: item.tweet_level.positive,
      total: item.tweet_level.total,
      percentage: item.tweet_level.percentage,
    }),
  );

  return (
    <div className="space-y-12">
      {/* Stage 1 */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Stage 1 — Binary Classification"
          title="Toxicity distribution"
          description="Distribution of toxic and non-toxic tweets based on final majority-vote labels."
        />

        {toxicityData.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChartCard
              title="Toxic vs. Non-Toxic"
              description={`${totalValidTweets.toLocaleString()} tweets with valid majority-vote labels.`}
              data={toxicityData}
            />

            {/* <Card className="flex flex-col justify-center p-6">
              <p className="text-sm text-muted-foreground">
                Toxic Tweets
              </p>

              <p className="mt-2 font-display text-4xl font-extrabold">
                {totalToxicTweets.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {toxicItem?.percentage.toFixed(2) ?? '0.00'}%
                {' '}of tweets with valid labels were classified as toxic.
              </p>

              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Final majority-vote distribution
                </p>

                <div className="mt-3 flex justify-between text-sm">
                  <span>Non-Toxic</span>
                  <span className="font-semibold">
                    {(nonToxicItem?.count ?? 0).toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span>Toxic</span>
                  <span className="font-semibold">
                    {totalToxicTweets.toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Tweets excluded from valid label distribution
                  </p>

                  <div className="mt-3 flex justify-between text-sm">
                    <span>Tied votes</span>
                    <span className="font-semibold">
                      {data.toxicity.tweet_level.tie_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span>No votes</span>
                    <span className="font-semibold">
                      {data.toxicity.tweet_level.no_vote_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card> */}
          </div>
        ) : (
          <EmptyChart
            title="Toxicity distribution"
            description="No tweet-level toxicity distribution is available."
          />
        )}
      </section>

      {/* Stage 2 */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Stage 2 — Multi-label Classification"
          title="Toxicity category distribution"
          description="Distribution of toxicity categories among tweets classified as toxic in Stage 1."
        />

        {categoryData.length > 0 ? (
          <div className="space-y-4">
            <BarChartCard
              title="Toxicity Categories"
              description="Number of toxic tweets assigned to each category based on majority voting."
              data={categoryData}
            />

            <p className="text-xs text-muted-foreground">
              Note: Stage 2 is performed only on toxic tweets.
              Since this is a multi-label classification task,
              one tweet may belong to multiple categories.
              Therefore, category counts may overlap.
            </p>
          </div>
        ) : (
          <EmptyChart
            title="Toxicity category distribution"
            description="No tweet-level toxicity category distribution is available."
          />
        )}
      </section>
    </div>
  );
}
