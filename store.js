import { create } from "zustand";

const useStore = create((set) => ({
  email: "",
  password: "",

  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  setEmail: (email) => set(() => ({ email })),
  setPassword: (password) => set(() => ({ password })),
  reset: () => set(() => ({ email: "", password: "" })),
}));

export default useStore;
