import { create } from "zustand";

const useStore = create((set) => ({
  email: "",
  password: "",
  selectedNode: null,
  selectedAction: null,
  selectedActions: [],

  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  setEmail: (email) => set(() => ({ email })),
  setPassword: (password) => set(() => ({ password })),
  reset: () => set(() => ({ email: "", password: "" })),
  setSelectedNode: (node) =>
    set(() => ({
      selectedNode: node ? node : null,
    })),
  setSelectedAction: (action) => set(() => ({ selectedAction: action })),
  setSelectedActions: (actions) =>
    set((state) => ({
      selectedActions: [...state.selectedActions, actions],
    })),
}));

export default useStore;
