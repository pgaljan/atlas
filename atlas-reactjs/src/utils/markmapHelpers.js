import * as d3 from "d3";

export const assignWbsNumbers = (
  node,
  prefix = null,
  parentStructureId = null
) => {
  if (!node) return null;

  const currentWbs = node.wbs ? node.wbs : prefix ? prefix : "1";
  const wbsNode = {
    ...node,
    originalContent: node.originalContent || node.content,
    wbs: currentWbs,
    structureId: node.structureId || parentStructureId,
  };

  // If node has children, sort them based on orderIndex (if present) before processing
  if (node.children && node.children.length > 0) {
    const sortedChildren = node.children.slice().sort((a, b) => {
      if (a.orderIndex != null && b.orderIndex != null) {
        return a.orderIndex - b.orderIndex;
      }
      return 0;
    });

    wbsNode.children = sortedChildren.map((child, index) =>
      assignWbsNumbers(
        child,
        child.wbs ? child.wbs : `${currentWbs}.${index + 1}`,
        wbsNode.structureId
      )
    );
  }
  return wbsNode;
};

const truncateText = (text, limit = 16) => {
  if (!text) return "";
  return text.length > limit ? text.substring(0, limit) + "..." : text;
};

export const treeToMarkmapData = (node, showWbs, includeWbs) => {
  if (!node) return null;

  const actualContent = node.originalContent || node.content || node.name;
  const isRoot = node.level === 0;
  const truncatedContent = isRoot
    ? actualContent
    : truncateText(actualContent, 16);
  const shouldShowWbs = showWbs || includeWbs;
  const updatedContent =
    shouldShowWbs && node.wbs && node.wbs !== "1"
      ? `${node.wbs} - ${truncatedContent}`
      : truncatedContent;
  return {
    content: updatedContent,
    originalContent: actualContent,
    color: node.color || null,
    children: (node.children || []).map((child) =>
      treeToMarkmapData(child, showWbs, includeWbs)
    ),
    state: node.state,
    wbs: node.wbs,
    structureId: node.structureId,
    elementId: node.id,
    parentId: node.parentId,
    recordId: node.recordId,
  };
};

export const isDescendant = (parent, childContent) => {
  if (!parent.children) return false;

  return parent.children.some(
    (child) =>
      child.originalContent === childContent ||
      isDescendant(child, childContent)
  );
};

export const removeNode = (node, targetContent) => {
  if (node.originalContent === targetContent) return null;

  return {
    ...node,
    children: node.children
      ?.map((child) => removeNode(child, targetContent))
      .filter(Boolean),
  };
};

export const addNodeToTarget = (node, targetContent, newNode) => {
  if (node.originalContent === targetContent) {
    return {
      ...node,
      children: [...(node.children || []), newNode],
    };
  }

  return {
    ...node,
    children: node.children
      ? node.children.map((child) =>
          addNodeToTarget(child, targetContent, newNode)
        )
      : [],
  };
};

export const resetDraggedElement = (element) => {
  const draggedElement = d3.select(element);
  const originalTransform = draggedElement.attr("original-transform");
  if (originalTransform) {
    draggedElement.attr("transform", originalTransform);
  }
};

export const updateNodeLevels = (node, currentLevel = 0) => {
  node.level = currentLevel;

  if (node.children && node.children?.length > 0) {
    node.children.forEach((child) => updateNodeLevels(child, currentLevel + 1));
  }

  return node;
};

export const assignNodeColors = (node, colorScale) => {
  node.color = colorScale(node.depth);

  if (node.children) {
    node.children.forEach((child) => {
      assignNodeColors(child, colorScale);
    });
  }
};
