import React from "react";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { useExperimentStore } from "../../store/experimentStore";

const Header: React.FC = () => {
  const { experiments, selectedExperiments, uploadedFile, clearData } =
    useExperimentStore();

  const startContent = (
    <div className="flex align-items-center gap-3">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-chart-line text-2xl text-primary"></i>
        <h1 className="text-2xl font-bold m-0">MLOps Experiment Tracker</h1>
      </div>

      {experiments.length > 0 && (
        <div className="flex gap-2">
          <Badge value={`${experiments.length} experiments`} severity="info" />
          {selectedExperiments.length > 0 && (
            <Badge
              value={`${selectedExperiments.length} selected`}
              severity="success"
            />
          )}
        </div>
      )}
    </div>
  );

  const endContent = (
    <div className="flex align-items-center gap-2">
      {uploadedFile && (
        <div className="text-sm text-color-secondary mr-3">
          <i className="pi pi-file mr-1"></i>
          {uploadedFile.name}
        </div>
      )}

      {experiments.length > 0 && (
        <Button
          label="Clear All Data"
          icon="pi pi-trash"
          className="p-button-outlined p-button-danger"
          size="small"
          onClick={clearData}
          tooltip="Remove all uploaded data and start over"
          tooltipOptions={{ position: "bottom" }}
        />
      )}
    </div>
  );

  return (
    <Toolbar
      start={startContent}
      end={endContent}
      className="mb-4 shadow-2 border-round"
    />
  );
};

export default Header;
