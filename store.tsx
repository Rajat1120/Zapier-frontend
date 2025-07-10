import { create } from "zustand";

import type { Node } from "@xyflow/react";
import {
  CustomNode,
  Action,
  AvailableAction,
  SelectedAction,
} from "@/lib/type";
import { ParamValue } from "next/dist/server/request/params";

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
  showZapModal: boolean;
  connecting: boolean;
  connected: false;
  zapTriggerMeta: {
    zapId: string;
    triggerApp: string;
    triggerEvent: string;
  } | null;

  setEmail: (email: string) => void;
  setConnected: (val: boolean) => void;
  setPassword: (password: string) => void;
  setConnecting: (val: boolean) => void;
  setActions: (val: Action[]) => void;
  setShowZapModal: (val: boolean) => void;
  setAvailableActions: (val: AvailableAction[]) => void;
  reset: () => void;
  setSelectedNode: (node: Node | null) => void;
  setSelectedAction: (action: AvailableAction | null) => void;
  setZapTrigger: (action: SelectedAction | Action | null) => void;
  setSelectedActions: (newAction: SelectedAction | null) => void;
  setFilterNodes: (filterNodes: CustomNode[]) => void;
  setZapTriggerMeta: (meta: {
    zapId: ParamValue;
    triggerApp: string;
    triggerEvent: string;
  }) => void;
};

const useStore = create<StoreState>((set) => ({
  email: "",
  password: "",
  selectedNode: null,
  connected: false,
  showZapModal: false,
  selectedAction: null,
  selectedActions: [],
  zapTrigger: null,
  connecting: false,
  actions: [],
  AvailableActions: [],
  filterNodes: [],
  zapTriggerMeta: null,
  setEmail: (email) => set(() => ({ email })),
  setConnected: (val) => () => ({ connected: val }),
  setConnecting: (val) => set(() => ({ connecting: val })),
  setShowZapModal: (val) => set(() => ({ showZapModal: val })),
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
  setZapTriggerMeta: (meta) => set(() => ({ zapTriggerMeta: meta })),
}));

export default useStore;
