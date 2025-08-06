import React, { useMemo } from "react";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { useExperimentStore } from "../../store/experimentStore";
import { getUniqueMetrics } from "../../utils/dataTransformer";
import MetricChart from "./MetricChart";

const ChartContainer: React.FC = () => {
  const { experiments, selectedExperiments } = useExperimentStore();

  const availableMetrics = useMemo(() => {
    const selectedExps = experiments.filter((exp) =>
      selectedExperiments.includes(exp.id)
    );
    return getUniqueMetrics(selectedExps);
  }, [experiments, selectedExperiments]);

  if (experiments.length === 0) {
    return (
      <Card title="Visualizations" className="mb-4 p-4">
        <div className="text-center p-4 text-color-secondary">
          <i className="pi pi-chart-line text-4xl mb-3"></i>
          <p>No experiments loaded. Please upload a CSV file first.</p>
        </div>
      </Card>
    );
  }

  if (selectedExperiments.length === 0) {
    return (
      <Card title="Visualizations" className="mb-4 p-4">
        <Message
          severity="info"
          text="Please select one or more experiments to view charts"
          className="w-full"
        />
        <div className="text-center p-4 text-color-secondary">
          <i className="pi pi-info-circle text-4xl mb-3"></i>
          <p>
            Select experiments from the table above to see their metrics
            visualized as line charts.
          </p>
        </div>
      </Card>
    );
  }

  if (availableMetrics.length === 0) {
    return (
      <Card title="Visualizations" className="mb-4 p-4">
        <Message
          severity="warn"
          text="Selected experiments have no metrics to display"
          className="w-full"
        />
      </Card>
    );
  }

  return (
    <div className="chart-container p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Experiment Metrics</h2>
        <p className="text-color-secondary">
          Showing {availableMetrics.length} metric
          {availableMetrics.length !== 1 ? "s" : ""} for{" "}
          {selectedExperiments.length} selected experiment
          {selectedExperiments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {availableMetrics.map((metricName) => (
        <MetricChart key={metricName} metricName={metricName} />
      ))}
    </div>
  );
};

export default ChartContainer;
