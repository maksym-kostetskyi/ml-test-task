import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, ProcessedExperiment } from "../types/experiment.types";

interface ExperimentStore extends AppState {
  // Actions
  setExperiments: (experiments: ProcessedExperiment[]) => void;
  toggleExperimentSelection: (experimentId: string) => void;
  selectAllExperiments: () => void;
  selectExperiments: (experimentIds: string[]) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  clearData: () => void;
  // Add flag for large dataset warning
  isLargeDataset: boolean;
  setLargeDatasetFlag: (isLarge: boolean) => void;
}

const initialState: AppState = {
  experiments: [],
  selectedExperiments: [],
  isLoading: false,
  error: null,
  uploadedFile: null,
};

const initialStoreState = {
  ...initialState,
  isLargeDataset: false,
};

export const useExperimentStore = create<ExperimentStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      setExperiments: (experiments) => {
        // Check if dataset is large
        const totalDataPoints = experiments.reduce(
          (sum, exp) => sum + exp.dataPoints.length,
          0
        );
        const isLarge = totalDataPoints > 10000;

        set({
          experiments,
          error: null,
          isLargeDataset: isLarge,
          // Clean up selectedExperiments - only keep IDs that exist in new experiments
          selectedExperiments:
            get().selectedExperiments.filter((id) =>
              experiments.some((exp) => exp.id === id)
            ).length > 0
              ? get().selectedExperiments.filter((id) =>
                  experiments.some((exp) => exp.id === id)
                )
              : experiments.length > 0
              ? [experiments[0].id] // Auto-select first if nothing valid selected
              : [],
        });
      },

      toggleExperimentSelection: (experimentId) => {
        const { selectedExperiments } = get();
        const isSelected = selectedExperiments.includes(experimentId);

        set({
          selectedExperiments: isSelected
            ? selectedExperiments.filter((id) => id !== experimentId)
            : [...selectedExperiments, experimentId],
        });
      },

      selectAllExperiments: () => {
        const { experiments } = get();
        set({ selectedExperiments: experiments.map((exp) => exp.id) });
      },

      selectExperiments: (experimentIds) => {
        // Validate that all provided IDs exist in current experiments
        const { experiments } = get();
        const validIds = experimentIds.filter((id) =>
          experiments.some((exp) => exp.id === id)
        );
        set({ selectedExperiments: validIds });
      },

      clearSelection: () => {
        set({ selectedExperiments: [] });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      setUploadedFile: (uploadedFile) => {
        set({ uploadedFile });
      },

      setLargeDatasetFlag: (isLarge) => {
        set({ isLargeDataset: isLarge });
      },

      clearData: () => {
        set(initialStoreState);
      },
    }),
    {
      name: "experiment-store",
      // Only persist selectedExperiments for large datasets to avoid localStorage quota
      // Experiments data will be cleared on page refresh (user needs to re-upload)
      partialize: (state) => ({
        selectedExperiments: state.selectedExperiments,
        // Don't persist experiments to avoid localStorage quota issues with large datasets
      }),
      // Add storage size check and fallback
      storage: {
        getItem: (key) => {
          try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
          } catch (error) {
            console.warn("Error reading from localStorage:", error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            const serialized = JSON.stringify(value);
            // Check size (rough estimate: 2 bytes per character)
            const sizeInMB = (serialized.length * 2) / (1024 * 1024);

            if (sizeInMB > 4) {
              // Keep under 5MB limit
              console.warn(
                "Data too large for localStorage, skipping persistence"
              );
              return;
            }

            localStorage.setItem(key, serialized);
          } catch (error) {
            console.warn("Failed to save to localStorage:", error);
            // Clear storage and try again with minimal data
            try {
              localStorage.removeItem(key);
              localStorage.setItem(
                key,
                JSON.stringify({ selectedExperiments: [] })
              );
            } catch (fallbackError) {
              console.error("Critical localStorage error:", fallbackError);
            }
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn("Error removing from localStorage:", error);
          }
        },
      },
    }
  )
);
