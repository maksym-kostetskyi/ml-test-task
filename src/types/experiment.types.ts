export interface ExperimentData {
  experiment_id: string;
  metric_name: string;
  step: number;
  value: number;
}

export interface ProcessedExperiment {
  id: string;
  metrics: string[];
  totalSteps: number;
  dataPoints: ExperimentData[];
  summary: {
    [metricName: string]: {
      min: number;
      max: number;
      avg: number;
      latest: number;
    };
  };
}

export interface ChartDataPoint {
  step: number;
  [experimentId: string]: number;
}

export interface AppState {
  experiments: ProcessedExperiment[];
  selectedExperiments: string[];
  isLoading: boolean;
  error: string | null;
  uploadedFile: File | null;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}
