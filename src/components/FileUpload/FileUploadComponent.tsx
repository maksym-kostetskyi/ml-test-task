import React, { useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import type { FileUploadHandlerEvent } from "primereact/fileupload";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Message } from "primereact/message";
import { useCSVParser } from "../../hooks/useCSVParser";
import { useExperimentStore } from "../../store/experimentStore";

const FileUploadComponent: React.FC = () => {
  const fileUploadRef = useRef<FileUpload>(null);
  const { parseCSVFile, uploadState, clearUploadState } = useCSVParser();
  const { experiments, uploadedFile, clearData, isLargeDataset } =
    useExperimentStore();

  const handleFileSelect = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    if (file) {
      clearUploadState();
      await parseCSVFile(file);
      // Clear the file upload component
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    }
  };

  const handleClearData = () => {
    clearData();
    clearUploadState();
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const emptyTemplate = () => (
    <div className="text-center p-4">
      <i className="pi pi-cloud-upload text-6xl text-primary mb-3"></i>
      <p className="text-xl mb-2">Drag and drop CSV file here</p>
      <p className="text-sm text-color-secondary mb-3">
        File should contain: experiment_id, metric_name, step, value columns
      </p>
      <p className="text-sm text-color-secondary">
        Or click "Choose File" to browse
      </p>
    </div>
  );

  return (
    <div className="file-upload-component">
      <Card title="Upload Experiment Data" className="mb-4">
        {!uploadedFile && experiments.length === 0 && (
          <FileUpload
            ref={fileUploadRef}
            name="csvFile"
            accept=".csv"
            maxFileSize={104857600} // 100MB
            customUpload
            uploadHandler={handleFileSelect}
            emptyTemplate={emptyTemplate}
            chooseOptions={{
              label: "Choose File",
              icon: "pi pi-plus",
              className: "p-button-outlined",
            }}
            disabled={uploadState.isUploading}
            className="mb-3"
          />
        )}

        {uploadState.isUploading && (
          <div className="mb-3">
            <label htmlFor="upload-progress" className="block mb-2">
              Processing file...
            </label>
            <ProgressBar
              id="upload-progress"
              value={uploadState.progress}
              showValue={false}
              className="mb-2"
            />
            <small className="text-color-secondary">
              {uploadState.progress}% complete
            </small>
          </div>
        )}

        {uploadState.error && (
          <Message
            severity="error"
            text={uploadState.error}
            className="mb-3 w-full"
          />
        )}

        {uploadedFile && experiments.length > 0 && (
          <div className="bg-primary-50 border-round p-3 mb-3">
            <div className="flex justify-content-between align-items-center">
              <div>
                <h4 className="m-0 mb-2 text-primary">
                  <i className="pi pi-check-circle mr-2"></i>
                  File Uploaded Successfully
                </h4>
                <p className="m-0 text-sm">
                  <strong>File:</strong> {uploadedFile.name} (
                  {(uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
                <p className="m-0 text-sm">
                  <strong>Experiments:</strong> {experiments.length}
                </p>
                <p className="m-0 text-sm">
                  <strong>Total Data Points:</strong>{" "}
                  {experiments.reduce(
                    (sum, exp) => sum + exp.dataPoints.length,
                    0
                  )}
                </p>
                {isLargeDataset && (
                  <p className="m-0 text-sm text-orange-600">
                    <i className="pi pi-info-circle mr-1"></i>
                    <strong>Large Dataset:</strong> Data won't persist across
                    browser sessions to avoid storage limits. Charts use smart
                    sampling for optimal performance.
                  </p>
                )}
              </div>
              <Button
                label="Upload New File"
                icon="pi pi-refresh"
                className="p-button-outlined p-button-secondary"
                onClick={handleClearData}
                size="small"
              />
            </div>
          </div>
        )}

        <div className="text-sm text-color-secondary">
          <p className="mb-2">
            <strong>Expected CSV format (up to 100 MB):</strong>
          </p>
          <ul className="pl-3 mb-2">
            <li>
              <code>experiment_id</code> - String identifier for the experiment
            </li>
            <li>
              <code>metric_name</code> - Name of the tracked metric (e.g.,
              "loss", "accuracy")
            </li>
            <li>
              <code>step</code> - Training step number (integer)
            </li>
            <li>
              <code>value</code> - Metric value at that step (number)
            </li>
          </ul>
          <p className="mb-0 text-xs">
            <strong>Note:</strong> Large files (&gt;10K rows) may take a moment
            to process. Check the <code>sample_data/</code> folder for a 25K row
            example dataset.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FileUploadComponent;
