import { useState, useCallback } from "react";
import { usePapaParse } from "react-papaparse";
import { useExperimentStore } from "../store/experimentStore";
import { validateCSVData, parseCSVData } from "../utils/csvValidator";
import { transformExperimentData } from "../utils/dataTransformer";
import type { FileUploadState } from "../types/experiment.types";

type CSVRow = Record<string, string | number>;

export const useCSVParser = () => {
  const { readString } = usePapaParse();
  const { setExperiments, setLoading, setError, setUploadedFile } =
    useExperimentStore();

  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const parseCSVFile = useCallback(
    async (file: File) => {
      setUploadState({ isUploading: true, progress: 0, error: null });
      setLoading(true);
      setError(null);

      try {
        // Simulate progress for better UX
        setUploadState((prev) => ({ ...prev, progress: 10 }));

        const text = await file.text();
        setUploadState((prev) => ({ ...prev, progress: 30 }));

        readString(text, {
          header: true,
          skipEmptyLines: true,
          transform: (value: string, column: string) => {
            // Convert numeric columns
            if (["step", "value"].includes(column)) {
              const numValue = Number(value);
              return isNaN(numValue) ? value : numValue;
            }
            return value.trim();
          },
          complete: (results) => {
            try {
              setUploadState((prev) => ({ ...prev, progress: 60 }));

              if (results.errors.length > 0) {
                const errorMessages = results.errors
                  .map((err) => err.message)
                  .join(", ");
                throw new Error(`CSV parsing errors: ${errorMessages}`);
              }

              // Validate data structure
              const validation = validateCSVData(results.data as CSVRow[]);
              if (!validation.isValid) {
                throw new Error(
                  `Invalid CSV data: ${validation.errors.join(", ")}`
                );
              }

              setUploadState((prev) => ({ ...prev, progress: 70 }));

              // Parse and transform data
              const parsedData = parseCSVData(results.data as CSVRow[]);
              if (parsedData.length === 0) {
                throw new Error("No valid data found in CSV file");
              }

              setUploadState((prev) => ({ ...prev, progress: 85 }));

              // For large datasets, use async processing to keep UI responsive
              const processLargeDataset = async () => {
                if (parsedData.length > 10000) {
                  // Add a small delay for very large datasets to keep UI responsive
                  await new Promise((resolve) => setTimeout(resolve, 100));
                }
                return transformExperimentData(parsedData);
              };

              processLargeDataset()
                .then((transformedExperiments) => {
                  setUploadState((prev) => ({ ...prev, progress: 100 }));

                  // Update store
                  setExperiments(transformedExperiments);
                  setUploadedFile(file);

                  setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: null,
                  });

                  setLoading(false);

                  return {
                    success: true,
                    experimentsCount: transformedExperiments.length,
                    totalDataPoints: parsedData.length,
                  };
                })
                .catch((error) => {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Error processing large dataset";
                  setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: errorMessage,
                  });
                  setError(errorMessage);
                  setLoading(false);

                  return {
                    success: false,
                    error: errorMessage,
                  };
                });
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              setUploadState({
                isUploading: false,
                progress: 0,
                error: errorMessage,
              });
              setError(errorMessage);
              setLoading(false);

              return {
                success: false,
                error: errorMessage,
              };
            }
          },
          error: (error) => {
            const errorMessage = `Failed to parse CSV: ${error.message}`;
            setUploadState({
              isUploading: false,
              progress: 0,
              error: errorMessage,
            });
            setError(errorMessage);
            setLoading(false);
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to read file";
        setUploadState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
        });
        setError(errorMessage);
        setLoading(false);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [readString, setExperiments, setLoading, setError, setUploadedFile]
  );

  const clearUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    parseCSVFile,
    uploadState,
    clearUploadState,
  };
};
