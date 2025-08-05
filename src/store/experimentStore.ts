import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, ProcessedExperiment } from "../types/experiment.types";

interface ExperimentStore extends AppState {
  // Actions
  setExperiments: (experiments: ProcessedExperiment[]) => void;
  toggleExperimentSelection: (experimentId: string) => void;
  selectAllExperiments: () => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  clearData: () => void;
}

const initialState: AppState = {
  experiments: [],
  selectedExperiments: [],
  isLoading: false,
  error: null,
  uploadedFile: null,
};

export const useExperimentStore = create<ExperimentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setExperiments: (experiments) => {
        set({
          experiments,
          error: null,
          // Auto-select first experiment if none selected
          selectedExperiments:
            experiments.length > 0 && get().selectedExperiments.length === 0
              ? [experiments[0].id]
              : get().selectedExperiments.filter((id) =>
                  experiments.some((exp) => exp.id === id)
                ),
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

      clearData: () => {
        set(initialState);
      },
    }),
    {
      name: "experiment-store",
      // Only persist experiments and selectedExperiments, not loading states
      partialize: (state) => ({
        experiments: state.experiments,
        selectedExperiments: state.selectedExperiments,
      }),
    }
  )
);
