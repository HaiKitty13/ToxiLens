import { ApiStatus } from '@/components/prediction/ApiStatus';
import { PredictionWorkbench } from '@/components/prediction/PredictionWorkbench';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ModelPrediction() {
  return (
    <>
      <PageHeader
        eyebrow="Model Prediction"
        title="Detect toxicity in Indonesian text."
        description="Run a two-stage model on a sentence or tweet: first decide whether it is toxic, then see which toxicity categories apply."
      >
        <ApiStatus />
      </PageHeader>
      <section className="container py-10 sm:py-12">
        <PredictionWorkbench />
      </section>
    </>
  );
}
