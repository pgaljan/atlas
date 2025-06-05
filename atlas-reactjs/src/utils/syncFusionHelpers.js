export const LAYOUT_CONFIG = {
  type: "HierarchicalTree",
  orientation: "LeftToRight",
  horizontalSpacing: 20,
  verticalSpacing: 60,
  enableCollapseExpand: true,
};

const LEVEL_COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#F28500",
  "#9D4EDD",
  "#00C2D1",
  "#FF7DFF",
  "#72EFDD",
  "#1ABC9C",
];

const getTopLevelAncestor = (nodes, nodeId) => {
  let current = nodes.find((n) => n.id === nodeId);
  let last = current;
  while (current && current.parent) {
    last = current;
    current = nodes.find((n) => n.id === current.parent);
    if (current?.parent === "1") return current.id;
  }
  return last.id;
};

export const createConnectors = (nodes) => {
  const groupColorMap = {};
  let colorIndex = 0;

  return nodes
    .filter((n) => n.parent)
    .map((n) => {
      const topAncestor = getTopLevelAncestor(nodes, n.id);

      if (!groupColorMap[topAncestor]) {
        groupColorMap[topAncestor] =
          LEVEL_COLORS[colorIndex % LEVEL_COLORS.length];
        colorIndex++;
      }

      const stroke = groupColorMap[topAncestor];

      return {
        id: `conn_${n.id}`,
        sourceID: n.parent,
        targetID: n.id,
        // visibility: nodesMap[n.id]?.visible ? undefined : "Hidden",
        type: "Bezier",
        style: { strokeColor: stroke, strokeWidth: 3 },
        sourceDecorator: { shape: "None" },
        targetDecorator: { shape: "None" },
      };
    });
};

export const isDescendant = (nodeId, potentialParentId, nodes) => {
  let currentNode = nodes.find((n) => n.id === potentialParentId);
  while (currentNode) {
    if (currentNode.parent === nodeId) return true;
    currentNode = nodes.find((n) => n.id === currentNode.parent);
  }
  return false;
};

export const generateWBSNumber = (nodeId, nodes) => {
  const node = nodes.find((n) => n.id === nodeId);
  const parentNode = node.parent
    ? nodes.find((n) => n.id === node.parent)
    : null;
  if (!parentNode) return "1";
  const siblings = nodes.filter((n) => n.parent === node.parent);
  const index = siblings.findIndex((n) => n.id === nodeId) + 1;
  return `${generateWBSNumber(parentNode.id, nodes)}.${index}`;
};
