import { create } from "zustand";

const useStore = create((set) => ({
  email: "",
  password: "",
  selectedNode: null,
  selectedAction: null,

  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  setEmail: (email) => set(() => ({ email })),
  setPassword: (password) => set(() => ({ password })),
  reset: () => set(() => ({ email: "", password: "" })),
  setSelectedNode: () =>
    set((state) => ({
      selectedNode: state.selectedNode ? null : "defaultNode",
    })),
  setSelectedAction: (action) => set(() => ({ selectedAction: action })),
}));

export default useStore;
