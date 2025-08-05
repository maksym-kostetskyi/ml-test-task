import type { ExperimentData } from "../types/experiment.types";

type CSVRow = Record<string, string | number>;

export const validateCSVData = (
  data: CSVRow[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredColumns = ["experiment_id", "metric_name", "step", "value"];

  if (!data || data.length === 0) {
    errors.push("CSV file is empty");
    return { isValid: false, errors };
  }

  // Check if first row has required columns
  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  const missingColumns = requiredColumns.filter(
    (col) => !columns.includes(col)
  );
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  // Validate data types and values
  data.forEach((row, index) => {
    if (!row.experiment_id || typeof row.experiment_id !== "string") {
      errors.push(`Row ${index + 1}: experiment_id must be a non-empty string`);
    }

    if (!row.metric_name || typeof row.metric_name !== "string") {
      errors.push(`Row ${index + 1}: metric_name must be a non-empty string`);
    }

    const step = Number(row.step);
    if (isNaN(step) || step < 0) {
      errors.push(`Row ${index + 1}: step must be a non-negative number`);
    }

    const value = Number(row.value);
    if (isNaN(value)) {
      errors.push(`Row ${index + 1}: value must be a valid number`);
    }
  });

  return { isValid: errors.length === 0, errors: errors.slice(0, 10) }; // Limit to first 10 errors
};

export const parseCSVData = (rawData: CSVRow[]): ExperimentData[] => {
  return rawData
    .filter((row) => row.experiment_id && row.metric_name) // Filter out invalid rows
    .map((row) => ({
      experiment_id: String(row.experiment_id).trim(),
      metric_name: String(row.metric_name).trim(),
      step: Number(row.step),
      value: Number(row.value),
    }))
    .filter((row) => !isNaN(row.step) && !isNaN(row.value)); // Filter out rows with invalid numbers
};
