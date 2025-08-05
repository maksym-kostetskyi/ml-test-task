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
  // Use separate selectors to ensure proper reactivity
  const experiments = useExperimentStore((state) => state.experiments);
  const selectedExperiments = useExperimentStore(
    (state) => state.selectedExperiments
  );
  const toggleExperimentSelection = useExperimentStore(
    (state) => state.toggleExperimentSelection
  );
  const selectExperiments = useExperimentStore(
    (state) => state.selectExperiments
  );

  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Force re-render when selectedExperiments changes
  const selectedCount = selectedExperiments.length;

  const filteredExperiments = useMemo(() => {
    if (!globalFilter) return experiments;

    const searchTerm = globalFilter.toLowerCase().trim();

    return experiments.filter((exp) => {
      // Search in experiment ID
      if (exp.id.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in metrics names
      if (
        exp.metrics.some((metric) => metric.toLowerCase().includes(searchTerm))
      ) {
        return true;
      }

      // Search in total steps (convert to string)
      if (exp.totalSteps.toString().includes(searchTerm)) {
        return true;
      }

      // Search in data points count
      if (exp.dataPoints.length.toString().includes(searchTerm)) {
        return true;
      }

      return false;
    });
  }, [experiments, globalFilter]);

  const isAllSelected = useMemo(() => {
    return (
      filteredExperiments.length > 0 &&
      filteredExperiments.every((exp) => selectedExperiments.includes(exp.id))
    );
  }, [filteredExperiments, selectedExperiments]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered experiments - keep only non-filtered selections
      const filteredIds = filteredExperiments.map((exp) => exp.id);
      const newSelection = selectedExperiments.filter(
        (id) => !filteredIds.includes(id)
      );
      selectExperiments(newSelection);
    } else {
      // Select all filtered experiments - add to existing selection
      const filteredIds = filteredExperiments.map((exp) => exp.id);
      const newSelection = [
        ...new Set([...selectedExperiments, ...filteredIds]),
      ];
      selectExperiments(newSelection);
    }
  };

  const selectionTemplate = (rowData: ProcessedExperiment) => {
    const isSelected = selectedExperiments.includes(rowData.id);

    return (
      <Checkbox
        key={`${rowData.id}-${selectedCount}-${isSelected}`}
        checked={isSelected}
        onChange={() => toggleExperimentSelection(rowData.id)}
      />
    );
  };

  const experimentIdTemplate = (rowData: ProcessedExperiment) => {
    return (
      <div className="flex align-items-center">
        <span className="font-medium">{rowData.id}</span>
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
          <i className="pi pi-search" style={{ left: "0.75rem" }} />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search experiments..."
            className="w-20rem pl-6"
          />
        </span>
        <Button
          label={isAllSelected ? "Deselect All" : "Select All"}
          icon={isAllSelected ? "pi pi-times" : "pi pi-check"}
          onClick={handleSelectAll}
          className="p-button-outlined"
          severity={isAllSelected ? "secondary" : "success"}
          size="small"
          disabled={experiments.length === 0}
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
    <Card className="mb-4" bodyClassName="p-0">
      <DataTable
        key={`datatable-${selectedCount}`} // Force re-render when selection changes
        value={filteredExperiments}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage={
          globalFilter
            ? `No experiments match "${globalFilter}"`
            : "No experiments found"
        }
        className="p-datatable-striped"
        tableStyle={{
          borderTop: "none",
          borderBottom: "none",
        }}
        size="small"
      >
        <Column
          headerStyle={{ width: "3rem" }}
          body={selectionTemplate}
          header="Select"
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
