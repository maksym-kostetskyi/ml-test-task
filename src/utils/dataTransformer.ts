import type {
  ExperimentData,
  ProcessedExperiment,
} from "../types/experiment.types";

export const transformExperimentData = (
  data: ExperimentData[]
): ProcessedExperiment[] => {
  const experimentsMap = new Map<string, ProcessedExperiment>();

  data.forEach((row) => {
    const { experiment_id, metric_name, step, value } = row;

    if (!experimentsMap.has(experiment_id)) {
      experimentsMap.set(experiment_id, {
        id: experiment_id,
        metrics: [],
        totalSteps: 0,
        dataPoints: [],
        summary: {},
      });
    }

    const experiment = experimentsMap.get(experiment_id)!;

    // Add metric if not already present
    if (!experiment.metrics.includes(metric_name)) {
      experiment.metrics.push(metric_name);
    }

    // Update total steps
    experiment.totalSteps = Math.max(experiment.totalSteps, step);

    // Add data point
    experiment.dataPoints.push(row);

    // Update summary statistics
    if (!experiment.summary[metric_name]) {
      experiment.summary[metric_name] = {
        min: value,
        max: value,
        avg: value,
        latest: value,
      };
    } else {
      const summary = experiment.summary[metric_name];
      summary.min = Math.min(summary.min, value);
      summary.max = Math.max(summary.max, value);
      summary.latest = value; // This will be overwritten, but we'll fix it below
    }
  });

  // Calculate averages and fix latest values
  experimentsMap.forEach((experiment) => {
    experiment.metrics.forEach((metricName) => {
      const metricData = experiment.dataPoints
        .filter((dp) => dp.metric_name === metricName)
        .sort((a, b) => a.step - b.step);

      if (metricData.length > 0) {
        const sum = metricData.reduce((acc, dp) => acc + dp.value, 0);
        experiment.summary[metricName].avg = sum / metricData.length;
        experiment.summary[metricName].latest =
          metricData[metricData.length - 1].value;
      }
    });

    // Sort metrics for consistent display
    experiment.metrics.sort();

    // Sort data points by step for better performance
    experiment.dataPoints.sort((a, b) => a.step - b.step);
  });

  return Array.from(experimentsMap.values()).sort((a, b) =>
    a.id.localeCompare(b.id)
  );
};

export const getUniqueMetrics = (
  experiments: ProcessedExperiment[]
): string[] => {
  const metricsSet = new Set<string>();
  experiments.forEach((exp) => {
    exp.metrics.forEach((metric) => metricsSet.add(metric));
  });
  return Array.from(metricsSet).sort();
};
