import type {
  ProcessedExperiment,
  ChartDataPoint,
} from "../types/experiment.types";

/**
 * Smart step sampling for large datasets - MLflow style
 * Returns optimal step indices to show ~maxPoints while preserving trend
 *
 * Example: For 1000 steps with maxPoints=25:
 * Input:  [0,1,2,3,4,5,...,998,999]
 * Output: [0,40,80,120,160,200,240,280,320,360,400,440,480,520,560,600,640,680,720,760,800,840,880,920,960,999]
 */
export const sampleSteps = (
  steps: number[],
  maxPoints: number = 25
): number[] => {
  if (steps.length <= maxPoints) {
    return steps; // Return all steps if dataset is small
  }

  const sampled: number[] = [];
  const stepCount = steps.length;

  // Always include first and last steps
  sampled.push(steps[0]);

  if (stepCount > 2) {
    // Calculate interval for middle points
    const middlePoints = maxPoints - 2; // Reserve space for first and last
    const interval = Math.max(1, Math.floor((stepCount - 2) / middlePoints));

    // Add evenly distributed middle points
    for (let i = interval; i < stepCount - 1; i += interval) {
      sampled.push(steps[i]);
    }

    // Always include the last step (avoid duplicate)
    if (steps[stepCount - 1] !== sampled[sampled.length - 1]) {
      sampled.push(steps[stepCount - 1]);
    }
  }

  return sampled.sort((a, b) => a - b);
};

export const prepareChartData = (
  experiments: ProcessedExperiment[],
  selectedExperimentIds: string[],
  metricName: string
): ChartDataPoint[] => {
  const selectedExperiments = experiments.filter(
    (exp) =>
      selectedExperimentIds.includes(exp.id) && exp.metrics.includes(metricName)
  );

  if (selectedExperiments.length === 0) return [];

  // Get all unique steps across selected experiments for this metric
  const allSteps = new Set<number>();
  selectedExperiments.forEach((exp) => {
    exp.dataPoints
      .filter((dp) => dp.metric_name === metricName)
      .forEach((dp) => allSteps.add(dp.step));
  });

  const sortedSteps = Array.from(allSteps).sort((a, b) => a - b);

  // Apply smart sampling for large datasets
  const sampledSteps = sampleSteps(sortedSteps);

  // Create chart data points using sampled steps
  const chartData: ChartDataPoint[] = sampledSteps.map((step) => {
    const dataPoint: ChartDataPoint = { step };

    selectedExperiments.forEach((exp) => {
      const value = exp.dataPoints.find(
        (dp) => dp.metric_name === metricName && dp.step === step
      )?.value;

      if (value !== undefined) {
        dataPoint[exp.id] = value;
      }
    });

    return dataPoint;
  });

  return chartData;
};

export const generateChartColors = (count: number): string[] => {
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#8dd1e1",
    "#d084d0",
    "#87d068",
    "#ffb347",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
  ];

  if (count <= colors.length) {
    return colors.slice(0, count);
  }

  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 60%)`);
  }

  return [...colors, ...additionalColors];
};

export const formatMetricName = (metricName: string): string => {
  return metricName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(2) + "M";
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(2) + "K";
  } else if (Math.abs(value) >= 1) {
    return value.toFixed(3);
  } else {
    return value.toExponential(2);
  }
};
