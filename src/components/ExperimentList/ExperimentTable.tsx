import React, { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { useExperimentStore } from "../../store/experimentStore";
import type { ProcessedExperiment } from "../../types/experiment.types";
import { formatValue } from "../../utils/chartHelpers";

const ExperimentTable: React.FC = () => {
  const {
    experiments,
    selectedExperiments,
    toggleExperimentSelection,
    selectAllExperiments,
    clearSelection,
  } = useExperimentStore();

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const filteredExperiments = useMemo(() => {
    if (!globalFilter) return experiments;

    return experiments.filter(
      (exp) =>
        exp.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
        exp.metrics.some((metric) =>
          metric.toLowerCase().includes(globalFilter.toLowerCase())
        )
    );
  }, [experiments, globalFilter]);

  const isAllSelected = useMemo(() => {
    return (
      filteredExperiments.length > 0 &&
      filteredExperiments.every((exp) => selectedExperiments.includes(exp.id))
    );
  }, [filteredExperiments, selectedExperiments]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered experiments
      const filteredIds = filteredExperiments.map((exp) => exp.id);
      filteredIds.forEach((id) => {
        if (selectedExperiments.includes(id)) {
          toggleExperimentSelection(id);
        }
      });
    } else {
      // Select all filtered experiments
      filteredExperiments.forEach((exp) => {
        if (!selectedExperiments.includes(exp.id)) {
          toggleExperimentSelection(exp.id);
        }
      });
    }
  };

  const selectionTemplate = (rowData: ProcessedExperiment) => {
    return (
      <Checkbox
        checked={selectedExperiments.includes(rowData.id)}
        onChange={() => toggleExperimentSelection(rowData.id)}
      />
    );
  };

  const headerSelectionTemplate = () => {
    return <Checkbox checked={isAllSelected} onChange={handleSelectAll} />;
  };

  const experimentIdTemplate = (rowData: ProcessedExperiment) => {
    return (
      <div className="flex align-items-center">
        <span className="font-medium">{rowData.id}</span>
        {selectedExperiments.includes(rowData.id) && (
          <Badge value="Selected" severity="success" className="ml-2" />
        )}
      </div>
    );
  };

  const metricsTemplate = (rowData: ProcessedExperiment) => {
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.metrics.map((metric) => (
          <Tag key={metric} value={metric} severity="info" />
        ))}
      </div>
    );
  };

  const stepsTemplate = (rowData: ProcessedExperiment) => {
    return (
      <div className="text-center">
        <span className="font-medium">{rowData.totalSteps + 1}</span>
        <small className="block text-color-secondary">steps</small>
      </div>
    );
  };

  const dataPointsTemplate = (rowData: ProcessedExperiment) => {
    return (
      <div className="text-center">
        <span className="font-medium">{rowData.dataPoints.length}</span>
        <small className="block text-color-secondary">points</small>
      </div>
    );
  };

  const summaryTemplate = (rowData: ProcessedExperiment) => {
    const firstMetric = rowData.metrics[0];
    if (!firstMetric || !rowData.summary[firstMetric]) {
      return <span className="text-color-secondary">-</span>;
    }

    const summary = rowData.summary[firstMetric];
    return (
      <div className="text-sm">
        <div>
          Latest:{" "}
          <span className="font-medium">{formatValue(summary.latest)}</span>
        </div>
        <div className="text-color-secondary">
          Range: {formatValue(summary.min)} - {formatValue(summary.max)}
        </div>
      </div>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row gap-3 align-items-center justify-content-between">
      <div className="flex align-items-center gap-3">
        <h3 className="m-0">Experiments ({filteredExperiments.length})</h3>
        {selectedExperiments.length > 0 && (
          <Badge
            value={`${selectedExperiments.length} selected`}
            severity="success"
          />
        )}
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search experiments..."
            className="w-20rem"
          />
        </span>
        <Button
          label="Select All"
          icon="pi pi-check"
          onClick={selectAllExperiments}
          className="p-button-outlined"
          size="small"
          disabled={experiments.length === 0}
        />
        <Button
          label="Clear"
          icon="pi pi-times"
          onClick={clearSelection}
          className="p-button-outlined p-button-secondary"
          size="small"
          disabled={selectedExperiments.length === 0}
        />
      </div>
    </div>
  );

  if (experiments.length === 0) {
    return (
      <Card title="Experiments" className="mb-4">
        <div className="text-center p-4 text-color-secondary">
          <i className="pi pi-inbox text-4xl mb-3"></i>
          <p>No experiments loaded. Please upload a CSV file first.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <DataTable
        value={filteredExperiments}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        globalFilter={globalFilter}
        emptyMessage="No experiments found"
        className="p-datatable-striped"
        size="small"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
          body={selectionTemplate}
          header={headerSelectionTemplate}
        />
        <Column
          field="id"
          header="Experiment ID"
          body={experimentIdTemplate}
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="metrics"
          header="Metrics"
          body={metricsTemplate}
          style={{ minWidth: "15rem" }}
        />
        <Column
          field="totalSteps"
          header="Steps"
          body={stepsTemplate}
          sortable
          style={{ width: "8rem" }}
        />
        <Column
          field="dataPoints.length"
          header="Data Points"
          body={dataPointsTemplate}
          sortable
          style={{ width: "10rem" }}
        />
        <Column
          header="Primary Metric Summary"
          body={summaryTemplate}
          style={{ minWidth: "15rem" }}
        />
      </DataTable>
    </Card>
  );
};

export default ExperimentTable;
