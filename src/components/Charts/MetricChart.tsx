import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useExperimentStore } from "../../store/experimentStore";
import {
  prepareChartData,
  generateChartColors,
  formatMetricName,
  formatValue,
} from "../../utils/chartHelpers";

interface MetricChartProps {
  metricName: string;
}

const MetricChart: React.FC<MetricChartProps> = ({ metricName }) => {
  const { experiments, selectedExperiments } = useExperimentStore();

  const chartData = useMemo(() => {
    return prepareChartData(experiments, selectedExperiments, metricName);
  }, [experiments, selectedExperiments, metricName]);

  const selectedExperimentDetails = useMemo(() => {
    return experiments.filter((exp) => selectedExperiments.includes(exp.id));
  }, [experiments, selectedExperiments]);

  const colors = useMemo(() => {
    return generateChartColors(selectedExperimentDetails.length);
  }, [selectedExperimentDetails.length]);

  // Calculate data density info for user feedback
  const dataDensityInfo = useMemo(() => {
    const totalDataPoints = selectedExperimentDetails.reduce((sum, exp) => {
      return (
        sum +
        exp.dataPoints.filter((dp) => dp.metric_name === metricName).length
      );
    }, 0);

    const displayedPoints = chartData.length;
    const isDownsampled =
      totalDataPoints > displayedPoints * selectedExperimentDetails.length;

    return {
      totalDataPoints,
      displayedPoints,
      isDownsampled,
      samplingRatio:
        totalDataPoints > 0
          ? (displayedPoints * selectedExperimentDetails.length) /
            totalDataPoints
          : 1,
    };
  }, [chartData, selectedExperimentDetails, metricName]);

  const customTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      color: string;
    }>;
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-round shadow-3 border-1 border-200">
          <p className="font-medium mb-2">
            {formatMetricName(metricName)} at Step {label}
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} className="m-0 mb-1" style={{ color: entry.color }}>
              <span className="font-medium">{entry.dataKey}:</span>{" "}
              {formatValue(entry.value)}
            </p>
          ))}
          {dataDensityInfo.isDownsampled && (
            <p className="text-xs text-color-secondary mt-2 mb-0">
              <i className="pi pi-info-circle mr-1"></i>
              Smart sampling applied
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleExportChart = () => {
    // Simple CSV export of chart data
    const csvContent = [
      ["Step", ...selectedExperimentDetails.map((exp) => exp.id)].join(","),
      ...chartData.map((row) =>
        [
          row.step,
          ...selectedExperimentDetails.map((exp) => row[exp.id] || ""),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metricName}_chart_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (chartData.length === 0) {
    return (
      <Card title={formatMetricName(metricName)} className="mb-4">
        <div className="text-center p-4 text-color-secondary">
          <i className="pi pi-chart-line text-4xl mb-3"></i>
          <p>No data available for selected experiments</p>
        </div>
      </Card>
    );
  }

  const cardHeader = (
    <div className="flex justify-content-between align-items-center">
      <div>
        <h4 className="m-0">{formatMetricName(metricName)}</h4>
        {chartData.length > 0 && (
          <small className="text-color-secondary">
            Steps {chartData[0].step} - {chartData[chartData.length - 1].step}
            {dataDensityInfo.isDownsampled && (
              <span className="ml-2">
                <i className="pi pi-chart-line mr-1"></i>
                Optimized view ({chartData.length} points)
              </span>
            )}
          </small>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          icon="pi pi-download"
          tooltip="Export Chart Data"
          tooltipOptions={{ position: "top" }}
          className="p-button-outlined p-button-sm"
          onClick={handleExportChart}
        />
      </div>
    </div>
  );

  return (
    <Card header={cardHeader} className="mb-4">
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="step"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => `Step ${value}`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={formatValue}
              tick={{ fontSize: 12 }}
              width={60}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            {selectedExperimentDetails.map((experiment, index) => (
              <Line
                key={experiment.id}
                type="monotone"
                dataKey={experiment.id}
                stroke={colors[index]}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {selectedExperimentDetails.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 border-round">
          <div className="flex justify-content-between align-items-start mb-2">
            <small className="text-color-secondary">
              Selected Experiments:
            </small>
            {dataDensityInfo.isDownsampled && (
              <small className="text-color-secondary">
                <i className="pi pi-info-circle mr-1"></i>
                Showing {dataDensityInfo.displayedPoints} of{" "}
                {Math.floor(
                  dataDensityInfo.totalDataPoints /
                    selectedExperimentDetails.length
                )}{" "}
                steps (Smart sampling applied)
              </small>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedExperimentDetails.map((exp, index) => (
              <div key={exp.id} className="flex align-items-center gap-1">
                <div
                  className="w-1rem h-1rem border-round"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className="text-sm">{exp.id}</span>
                {exp.summary[metricName] && (
                  <span className="text-xs text-color-secondary ml-1">
                    (Latest: {formatValue(exp.summary[metricName].latest)})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetricChart;
