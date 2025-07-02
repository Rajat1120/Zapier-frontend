import { create } from "zustand";

import type { Node } from "@xyflow/react";
import {
  CustomNode,
  Action,
  AvailableAction,
  SelectedAction,
} from "@/lib/type";

type StoreState = {
  email: string;
  password: string;
  selectedNode: Node | null;
  selectedAction: AvailableAction | null;
  selectedActions: SelectedAction[];
  zapTrigger: SelectedAction | Action | null;
  actions: Action[];
  AvailableActions: AvailableAction[];
  filterNodes: CustomNode[];

  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setActions: (val: Action[]) => void;
  setAvailableActions: (val: AvailableAction[]) => void;
  reset: () => void;
  setSelectedNode: (node: Node | null) => void;
  setSelectedAction: (action: AvailableAction | null) => void;
  setZapTrigger: (action: SelectedAction | Action | null) => void;
  setSelectedActions: (newAction: SelectedAction | null) => void;
  setFilterNodes: (filterNodes: CustomNode[]) => void;
};

const useStore = create<StoreState>((set) => ({
  email: "",
  password: "",
  selectedNode: null,
  selectedAction: null,
  selectedActions: [],
  zapTrigger: null,
  actions: [],
  AvailableActions: [],
  filterNodes: [],
  setEmail: (email) => set(() => ({ email })),
  setPassword: (password) => set(() => ({ password })),
  setActions: (val) => set(() => ({ actions: val })),
  setAvailableActions: (val) => set(() => ({ AvailableActions: val })),
  reset: () => set(() => ({ email: "", password: "" })),
  setFilterNodes: (nodes) => set(() => ({ filterNodes: nodes })),
  setSelectedNode: (node) => set(() => ({ selectedNode: node ?? null })),
  setSelectedAction: (action) => set(() => ({ selectedAction: action })),
  setZapTrigger: (action: SelectedAction | Action | null) =>
    set(() => ({ zapTrigger: action })),
  setSelectedActions: (newAction) =>
    set((state) => {
      if (!newAction) return { selectedActions: [] };
      const exists = state.selectedActions.some(
        (action) => action.sortingOrder === newAction.sortingOrder
      );

      return {
        selectedActions: exists
          ? state.selectedActions.map((action) =>
              action.sortingOrder === newAction.sortingOrder
                ? { ...action, ...newAction }
                : action
            )
          : [...state.selectedActions, newAction],
      };
    }),
}));

export default useStore;
