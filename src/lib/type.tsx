import { JSX } from "react";

type NodeData = {
  label: string | JSX.Element; // Allow both string and JSX elements
};

export type CustomNode = {
  id: string;
  position: { x: number; y: number };
  data: NodeData;
  connectable: boolean;
  style: { width: number; height: number };
};

export type SelectedAction = {
  name: string;
  sortingOrder: string;
  metadata: unknown;
  availableActionId: string;
  index: number;
};

export type UpdatedAction = {
  actionId: string;
  metadata: JSON;
  sortingOrder: number;
  index: number;
};

export type StrictEdge = {
  id: string;
  source: string;
  target: string;
  type: string; // not optional
};

export type Action = {
  id: string;
  zapId: string;
  actionId: string;
  metadata: JSON;
  sortingOrder: number;
  index: number;
};

export type AvailableAction = {
  id: string;
  name: string;
  image: string;
  selectionId: number;
};

export interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}
