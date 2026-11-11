
import { useCallback, useRef, useState } from 'react';
import { ApiError, predict, toApiError } from '@/services/api';
import type {
  MetadataValues,
  PredictionMode,
  PredictionResult,
  RequestStatus,
  ModelFamily,
} from '@/types/api';

interface PredictionState {
  status: RequestStatus;
  result: PredictionResult | null;
  error: ApiError | null;
  mode: PredictionMode | null;
}

const INITIAL: PredictionState = {
  status: 'idle',
  result: null,
  error: null,
  mode: null,
};

export function usePrediction(family: ModelFamily) {
  const [state, setState] = useState<PredictionState>(INITIAL);
  const requestId = useRef(0);

  const submit = useCallback(
    async (
      mode: PredictionMode,
      text: string,
      metadata: MetadataValues,
    ) => {
      const id = ++requestId.current;

      setState({
        status: 'loading',
        result: null,
        error: null,
        mode,
      });

      try {
        const result = await predict(
          family,
          mode,
          text,
          metadata,
        );

        if (id !== requestId.current) return;

        setState({
          status: 'success',
          result,
          error: null,
          mode,
        });
      } catch (err) {
        if (id !== requestId.current) return;

        setState({
          status: 'error',
          result: null,
          error: toApiError(err),
          mode,
        });
      }
    },
    [family],
  );

  const reset = useCallback(() => {
    requestId.current++;
    setState(INITIAL);
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
}
