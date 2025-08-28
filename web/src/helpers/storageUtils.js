import { STORAGE_KEY } from "./constants";

export const loadExpandedState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveExpandedState = (nodeId, isExpanded) => {
  const currentState = loadExpandedState();
  currentState[nodeId] = isExpanded;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
};
