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

export type AvailableActions = {
  id: string;
  name: string;
  image: string;
};
