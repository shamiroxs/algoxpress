// src/analytics/helpers/executionMetrics.ts

export type ExecutionMode =
  | 'step'
  | 'autoplay'
  | 'mixed';

export type ExecutionMetrics = {
    startedAt: number | null;
  
    completedAt: number | null;
  
    manualStepCount: number;
  
    autoplayStepCount: number;
  
    rewindCount: number;
  
    autoplayRuns: number;
  
    pauseCount: number;
  
    runtimeErrorCount: number;
  
    validationFailureCount: number;
  };

  export function createExecutionMetrics(): ExecutionMetrics {
    return {
      startedAt: null,
  
      completedAt: null,
  
      manualStepCount: 0,
  
      autoplayStepCount: 0,
  
      rewindCount: 0,
  
      autoplayRuns: 0,
  
      pauseCount: 0,
  
      runtimeErrorCount: 0,
  
      validationFailureCount: 0,
    };
  }

  export function buildExecutionSummary(
    metrics: ExecutionMetrics
  ) {
    const durationMs =
      metrics.startedAt && metrics.completedAt
        ? metrics.completedAt - metrics.startedAt
        : undefined;
  
    const totalSteps =
      metrics.manualStepCount +
      metrics.autoplayStepCount;
  
    const executionMode: ExecutionMode =
        metrics.manualStepCount > 0 &&
        metrics.autoplayRuns > 0
            ? 'mixed'
            : metrics.autoplayRuns > 0
            ? 'autoplay'
            : 'step';
  
    return {
      durationMs,
  
      totalSteps,
  
      executionMode,
  
      manualStepCount:
        metrics.manualStepCount,
  
      autoplayStepCount:
        metrics.autoplayStepCount,
  
      rewindCount:
        metrics.rewindCount,
  
      autoplayRuns:
        metrics.autoplayRuns,
  
      pauseCount:
        metrics.pauseCount,
  
      runtimeErrorCount:
        metrics.runtimeErrorCount,
  
      validationFailureCount:
        metrics.validationFailureCount,
    };
  }