import { create } from "zustand";

const useStore = create((set) => ({
  email: "",
  password: "",
  selectedNode: null,
  selectedAction: null,
  selectedActions: [],
  zapTrigger: null,
  currentZap: null,

  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  setEmail: (email) => set(() => ({ email })),
  setPassword: (password) => set(() => ({ password })),
  setCurrentZap: (zapId) => set(() => ({ currentZap: zapId })),
  reset: () => set(() => ({ email: "", password: "" })),
  setSelectedNode: (node) =>
    set(() => ({
      selectedNode: node ? node : null,
    })),
  setSelectedAction: (action) => set(() => ({ selectedAction: action })),
  setZapTrigger: (action) => set({zapTrigger: action}),
  setSelectedActions: (newAction) =>
  set((state) => {
    const exists = state.selectedActions.some(
      (action) => action.sortingOrder === newAction.sortingOrder
    );

    if (exists) {
      // update the existing item
      return {
        selectedActions: state.selectedActions.map((action) =>
          action.sortingOrder === newAction.sortingOrder ? { ...action, ...newAction } : action
        ),
      };
    } else {
      // add new item
      return {
        selectedActions: [...state.selectedActions, newAction],
      };
    }
  }),
}));

export default useStore;
