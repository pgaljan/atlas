export const assignWbsNumbers = (node, prefix = "1") => {
  if (!node) return null

  const wbsNode = {
    ...node,
    originalContent: node.originalContent || node.content,
    wbs: prefix,
  }

  if (node.children) {
    wbsNode.children = node.children.map((child, index) =>
      assignWbsNumbers(child, `${prefix}.${index + 1}`)
    )
  }

  return wbsNode
}

export const treeToMarkmapData = (node, showWbs) => {
  if (!node) return null

  const { originalContent, wbs, children = [] } = node
  const updatedContent =
    showWbs && wbs !== "1" ? `${wbs} - ${originalContent}` : originalContent

  return {
    content: updatedContent,
    originalContent,
    children: children.map(child => treeToMarkmapData(child, showWbs)),
    state: node.state,
    wbs: node.wbs,
  }
}

export const isDescendant = (parent, childContent) => {
  if (!parent.children) return false

  return parent.children.some(
    child =>
      child.originalContent === childContent ||
      isDescendant(child, childContent)
  )
}

export const removeNode = (node, targetContent) => {
  if (node.originalContent === targetContent) return null

  return {
    ...node,
    children: node.children
      ?.map(child => removeNode(child, targetContent))
      .filter(Boolean),
  }
}

export const addNodeToTarget = (node, targetContent, newNode) => {
  if (node.originalContent === targetContent) {
    return {
      ...node,
      children: [...(node.children || []), newNode],
    }
  }

  return {
    ...node,
    children: node.children
      ? node.children.map(child =>
          addNodeToTarget(child, targetContent, newNode)
        )
      : [],
  }
}

export const resetDraggedElement = element => {
  const draggedElement = d3.select(element)
  const originalTransform = draggedElement.attr("original-transform")
  if (originalTransform) {
    draggedElement.attr("transform", originalTransform)
  }
}

export const updateNodeLevels = (node, currentLevel = 0) => {
  node.level = currentLevel

  if (node.children && node.children.length > 0) {
    node.children.forEach(child => updateNodeLevels(child, currentLevel + 1))
  }

  return node
}
