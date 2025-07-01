import cogoToast from "@successtar/cogo-toast";
import "@syncfusion/ej2-icons/styles/material.css";
import {
  DataBinding,
  DiagramComponent,
  DiagramTools,
  HierarchicalTree,
  Inject,
  NodeConstraints,
  UndoRedo,
} from "@syncfusion/ej2-react-diagrams";
import "@syncfusion/ej2-react-navigations/styles/material.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import MarkmapHeader from "../../../components/markmap/markmap-layout/MarkmapHeader";
import NodeModal from "../../../components/modals/NodeModal";
import ZoomToolbar from "../../../components/syncfusion/Toolbar";
import {
  reparentElements,
  updateElementOrderIndex,
  updateExpandState,
} from "../../../redux/slices/elements";
import {
  getStructure,
  updateStructure,
  updateStructureExpandState,
} from "../../../redux/slices/structures";
import {
  createConnectors,
  generateWBSNumber,
  isDescendant,
  LAYOUT_CONFIG,
} from "../../../utils/syncFusionHelpers";
import ConfirmationModal from "./ConfirmationModal";
import useCaptureAndUploadSnapshot from "../../../hooks/useCaptureAndUploadSnapshot";

const getNodeLevel = (id, nodesMap, level = 0) => {
  const node = nodesMap[id];
  if (!node?.parent || !nodesMap[node?.parent]) return level;
  return getNodeLevel(node?.parent, nodesMap, level + 1);
};

const getTextWidth = (text, font = "20px 'Segoe UI', Arial, sans-serif") => {
  if (typeof document === "undefined") return 160;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width + 14;
};

const sortNodesByHierarchy = (rootId, allNodes) => {
  const nodeMap = Object.fromEntries(allNodes.map((n) => [n.id, n]));
  const childrenMap = {};

  for (const node of allNodes) {
    if (node.parent) {
      if (!childrenMap[node.parent]) {
        childrenMap[node.parent] = [];
      }
      childrenMap[node.parent].push(node);
    }
  }

  const sorted = [];

  const traverse = (nodeId) => {
    const node = nodeMap[nodeId];
    if (!node) return;
    sorted.push(node);

    const children = childrenMap[nodeId] || [];
    const orderedChildren = [...children].sort((a, b) => {
      if (a.orderIndex == null) return 1;
      if (b.orderIndex == null) return -1;
      return a.orderIndex - b.orderIndex;
    });

    for (const child of orderedChildren) {
      traverse(child.id);
    }
  };

  traverse(rootId);
  return sorted;
};

const Syncfusion = () => {
  const dispatch = useDispatch();
  const diagramRef = useRef(null);
  const dragInProgress = useRef(false);
  const { structureId } = useParams();
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [showWbs, setShowWbsState] = useState(false);
  const [wbsStart, setWbsStart] = useState(1);
  const [nodesData, setNodesData] = useState([]);
  const [connectorsData, setConnectorsData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 100, y: 100 });
  const [isLoading, setIsLoading] = useState(true);
  const [diagramKey, setDiagramKey] = useState(0);
  const [noResults, setNoResults] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    draggedNode: null,
    targetNode: null,
  });
  const childrenMapRef = useRef({});

  const fetchStructure = async () => {
    setIsLoading(true);
    try {
      const structure = await dispatch(getStructure(structureId)).unwrap();
      const startValue = structure?.wbsStart || 1;
      setWbsStart(startValue);
      setShowWbsState(structure.markmapShowWbs);

      setTreeData({
        content: structure?.name || "Main",
        children: structure?.elements || [],
      });

      const rootNode = {
        id: structure?.id,
        name: structure?.name || "Main",
        parent: null,
        isExpanded: structure?.isExpanded ?? true,
        visible: true,
        level: 0,
        orderIndex: null,
      };

      const childrenMap = {};

      const flattenElements = (
        elements,
        parentId = null,
        parentExpanded = true,
        level = 0
      ) => {
        let flatNodes = [];

        const sortedElements = [...elements].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );

        for (let element of sortedElements) {
          const isNodeExpanded = element?.isExpanded ?? true;
          const nodeVisible = parentExpanded || true; // Always mark as rendered

          const currentNode = {
            id: element?.id,
            name: element?.name || "Unnamed",
            parent: parentId,
            isExpanded: isNodeExpanded,
            visible: nodeVisible,
            recordId: element?.recordId || null,
            level,
            orderIndex: element?.orderIndex ?? 0,
          };

          // Store children reference
          if (!childrenMap[parentId]) {
            childrenMap[parentId] = [];
          }
          childrenMap[parentId].push(element.id);

          flatNodes.push(currentNode);

          if (Array.isArray(element.children) && element.children.length > 0) {
            flatNodes.push(
              ...flattenElements(
                element.children,
                element.id,
                parentExpanded && isNodeExpanded,
                level + 1
              )
            );
          }
        }

        return flatNodes;
      };
      childrenMapRef.current = childrenMap;

      const nodes = flattenElements(
        structure.elements,
        structure.id,
        structure?.isExpanded ?? true,
        1,
        structure.orderIndex
      );

      const fullNodes = [rootNode, ...nodes];
      const visibleNodeIds = new Set(
        fullNodes.filter((n) => n.visible).map((n) => n.id)
      );
      const connectors = createConnectors(fullNodes).filter(
        (conn) =>
          visibleNodeIds.has(conn.sourceID) && visibleNodeIds.has(conn.targetID)
      );

      // setNodesData(fullNodes);
      const sortedFullNodes = sortNodesByHierarchy(structure?.id, fullNodes);
      setNodesData(sortedFullNodes);

      setConnectorsData(connectors);
      setDiagramKey((prev) => prev + 1);
    } catch (err) {
      cogoToast.error("Failed to load structure");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAutoSave = async () => {
      const containerElement = diagramRef.current?.element;
      const svgElement = containerElement?.querySelector("svg");

      if (svgElement) {
        await useCaptureAndUploadSnapshot(svgElement, structureId, dispatch);
      }
    };

    const debounceTimer = setTimeout(handleAutoSave, 2000);

    return () => clearTimeout(debounceTimer);
  }, [structureId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const diagramElement = document.getElementById("orgDiagram");
      if (
        diagramElement &&
        !diagramElement.contains(event.target) &&
        diagramRef.current
      ) {
        diagramRef.current.clearSelection();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDiagramClick = (args) => {
    const diagram = diagramRef.current;
    if (!diagram) return;

    const clickedObj = args?.actualObject;

    const isNode = clickedObj?.shape !== undefined;
    const isConnector = clickedObj?.type === "Straight" || clickedObj?.segments;

    if (!isNode && !isConnector) {
      diagram.clearSelection();
      setSelectedNode(null);
      setIsModalOpen(false);
    }
  };

  const setShowWbsFactory = (value) => {
    return async () => {
      try {
        setShowWbsState(value);
        await dispatch(
          updateStructure({
            id: structureId,
            updateData: { markmapShowWbs: value },
          })
        ).unwrap();
        setDiagramKey((prev) => prev + 1);
        await fetchStructure();
      } catch (error) {
        cogoToast.error("Failed to toggle WBS visibility.");
      }
    };
  };

  const handleSetShowWbs = (value) => {
    const fn = setShowWbsFactory(value);
    fn();
  };

  useEffect(() => {
    setDiagramKey((prev) => prev + 1);
  }, [nodesData]);

  useEffect(() => {
    if (structureId) {
      fetchStructure();
    }
  }, [dispatch, structureId]);

  const nodesMap = useMemo(
    () => Object.fromEntries(nodesData.map((n) => [n.id, n])),
    [nodesData]
  );

  const onSelectionChange = (args) => {
    const selected = args?.newValue?.[0];
    if (!selected) return;

    setSelectedNode(selected);
    setIsModalOpen(true);

    const diagram = diagramRef.current;
    if (!diagram) return;

    const node = diagram.nodes.find((n) => n.id === selected.id);
    if (!node) return;

    const { offsetX, offsetY } = node;
    const zoom = diagram.scrollSettings.currentZoom || 1;
    const scrollX = diagram.scrollSettings.horizontalOffset || 0;
    const scrollY = diagram.scrollSettings.verticalOffset || 0;

    const diagramContainer = document.getElementById("orgDiagram");
    const containerRect = diagramContainer.getBoundingClientRect();

    const x = containerRect.left + (offsetX - scrollX) * zoom;
    const y = containerRect.top + (offsetY - scrollY) * zoom;

    const modalWidth = 300;
    const modalHeight = 200;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const clampedX = Math.min(Math.max(x, 0), screenWidth - modalWidth);
    const clampedY = Math.min(Math.max(y, 0), screenHeight - modalHeight);

    setModalPosition({ x: clampedX, y: clampedY });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handleZoomIn = () => {
    if (!diagramRef.current) return;
    diagramRef.current.zoomTo({ type: "ZoomIn", zoomFactor: 0.2 });
  };

  const handleZoomOut = () => {
    if (!diagramRef.current) return;
    diagramRef.current.zoomTo({ type: "ZoomOut", zoomFactor: 0.2 });
  };

  const handleNodeUpdate = async () => {
    await fetchStructure();
  };

  const onNodeDrop = useCallback(
    async (args) => {
      const diagram = diagramRef.current;
      if (!diagram) return;

      const draggedNodeId = args.element?.id;
      const targetNodeId = args.target?.id || structureId;

      if (
        dragInProgress.current ||
        !draggedNodeId ||
        draggedNodeId === targetNodeId
      )
        return;

      const isTargetRoot = targetNodeId === structureId;

      const isDroppingOnDescendant = isDescendant(
        draggedNodeId,
        targetNodeId,
        nodesData
      );
      if (isDroppingOnDescendant) {
        cogoToast.error("Cannot reparent to a descendant node.");
        return;
      }

      const draggedNode = nodesMap[draggedNodeId];
      const targetNode = isTargetRoot ? null : nodesMap[targetNodeId];

      const currentParent = draggedNode?.parent ?? null;
      const targetParent = isTargetRoot ? null : targetNode?.parent ?? null;

      const isSameParent = currentParent === targetParent;

      dragInProgress.current = true;

      if (isSameParent && !isTargetRoot) {
        setModalState({
          isOpen: true,
          draggedNode,
          targetNode,
        });
      } else {
        try {
          await dispatch(
            reparentElements({
              reparentingRequests: [
                {
                  sourceElementId: isTargetRoot ? null : targetNodeId,
                  targetElementId: draggedNodeId,
                  attributes: { structureId },
                },
              ],
            })
          );
          cogoToast.success("Node reparented successfully.");
          await fetchStructure();
        } catch (error) {
          cogoToast.error("Failed to reparent node.");
        } finally {
          dragInProgress.current = false;
        }
      }
    },
    [dispatch, nodesData, structureId, nodesMap]
  );

  const filterTreeByCriteria = (node, level, searchTerm, currentLevel = 0) => {
    if (!node) return null;

    const lowerSearch = searchTerm?.toLowerCase();
    const matchesLevel = level !== null && currentLevel === level;
    const matchesText = lowerSearch
      ? node?.name?.toLowerCase().includes(lowerSearch)
      : false;

    const filteredChildren = (node.children || [])
      .map((child) =>
        filterTreeByCriteria(child, level, searchTerm, currentLevel + 1)
      )
      .filter(Boolean);

    if (matchesLevel || matchesText || filteredChildren.length > 0) {
      if (matchesText && !highlightedNodeId) setHighlightedNodeId(node.id);
      return {
        ...node,
        visible: true,
        children: filteredChildren,
      };
    }

    return null;
  };

  const originalExpandStateRef = useRef({}); // Save original expand/collapse

  // Utility to backup original expand states
  const backupExpandStates = () => {
    const state = {};
    for (const node of nodesData) {
      state[node.id] = {
        isExpanded: node.isExpanded,
        visible: node.visible,
      };
    }
    originalExpandStateRef.current = state;
  };

  // Restore expand/collapse state
  const restoreExpandStates = () => {
    const restored = nodesData.map((n) => {
      const original = originalExpandStateRef.current[n.id];
      return {
        ...n,
        isExpanded: original?.isExpanded ?? n.isExpanded,
        visible: original?.visible ?? true,
      };
    });
    setNodesData(restored);
    setDiagramKey((prev) => prev + 1);
  };

  // Traverse tree to collect matched and parent nodes
  const searchTreeRecursive = (node, level, searchTerm, currentLevel = 0) => {
    if (!node) return null;

    const lowerSearch = searchTerm?.toLowerCase();
    const matchesLevel = level !== null && currentLevel === level;
    const matchesText = lowerSearch
      ? node.name?.toLowerCase().includes(lowerSearch)
      : false;

    let firstMatchId = null;

    const matchedChildren = (node.children || [])
      .map((child) =>
        searchTreeRecursive(child, level, searchTerm, currentLevel + 1)
      )
      .filter(Boolean);

    if (matchesText) {
      firstMatchId = node.id;
    } else {
      for (const child of matchedChildren) {
        if (child._firstMatchId) {
          firstMatchId = child._firstMatchId;
          break;
        }
      }
    }

    const isMatch = matchesText || matchesLevel;

    if (isMatch || matchedChildren.length > 0) {
      return {
        ...node,
        children: matchedChildren,
        _firstMatchId: firstMatchId,
      };
    }

    return null;
  };

  // Flatten recursive tree to array
  const flattenFilteredTree = (node, parentId = null, level = 0) => {
    if (!node) return [];

    const currentNode = {
      id: node.id,
      name: node.name || "Unnamed",
      parent: parentId,
      isExpanded: true, // Always expand for result visibility
      visible: true,
      level,
      orderIndex: node.orderIndex ?? 0,
      recordId: node.recordId ?? null,
    };

    const children = (node.children || []).flatMap((child) =>
      flattenFilteredTree(child, node.id, level + 1)
    );

    return [currentNode, ...children];
  };

  // ✅ Main search handler
  const handleSearch = (level, searchTerm) => {
    setSearchLoading(true);
    setCurrentSearchTerm(searchTerm);
    setNoResults(null);
    setHighlightedNodeId(null);

    const cleanSearchTerm = (searchTerm || "").trim().toLowerCase();
    const isLevelOnlySearch = level !== null && !cleanSearchTerm;

    // If search is empty
    if (!cleanSearchTerm && !isLevelOnlySearch) {
      restoreExpandStates();
      fetchStructure();
      setSearchLoading(false);
      return;
    }

    backupExpandStates();

    let firstMatchedNodeId = null;

    const matchedChildren = (treeData?.children || [])
      .map((child) => {
        const result = searchTreeRecursive(child, level, cleanSearchTerm, 1);
        if (result && result._firstMatchId && !firstMatchedNodeId) {
          firstMatchedNodeId = result._firstMatchId;
        }
        return result;
      })
      .filter(Boolean);

    if (!matchedChildren.length) {
      setNoResults(true);
      setDiagramKey((prev) => prev + 1);
      setSearchLoading(false);
      return;
    }

    const rootNode = {
      id: structureId,
      name: treeData?.content || "Main",
      parent: null,
      isExpanded: true,
      visible: true,
      level: 0,
      orderIndex: null,
    };

    const flattened = [
      rootNode,
      ...matchedChildren.flatMap((child) =>
        flattenFilteredTree(child, rootNode.id, 1)
      ),
    ];

    // Highlight first match
    setHighlightedNodeId(firstMatchedNodeId);
    // skip root

    // Recalculate connectors
    const sortedFlat = sortNodesByHierarchy(structureId, flattened);
    const visibleNodeIds = new Set(sortedFlat.map((n) => n.id));
    const connectors = createConnectors(sortedFlat).filter(
      (conn) =>
        visibleNodeIds.has(conn.sourceID) && visibleNodeIds.has(conn.targetID)
    );

    setNodesData(sortedFlat);
    setConnectorsData(connectors);
    setDiagramKey((prev) => prev + 1);
    setSearchLoading(false);
  };

  useEffect(() => {
    document.fonts?.ready?.then(() => {
      setDiagramKey((prev) => prev + 1);
    });
  }, []);

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <MarkmapHeader
            onSuccess={fetchStructure}
            structureId={structureId}
            showWbs={showWbs}
            wbsStart={wbsStart}
            setWbsStart={setWbsStart}
            treeData={treeData}
            setShowWbs={handleSetShowWbs}
            onSearch={handleSearch}
          />
        </div>

        <DiagramComponent
          key={diagramKey}
          id="orgDiagram"
          ref={diagramRef}
          width="100%"
          height="1000px"
          pageSettings={{
            background: {
              color: "white",
            },
          }}
          nodes={nodesData.map((node) => {
            const children = nodesData.filter((n) => n.parent === node.id);
            const hasAnyChildren = !!childrenMapRef.current[node.id]?.length;

            const wbsPrefix = showWbs
              ? `${generateWBSNumber(node.id, nodesData, wbsStart)} - `
              : "";
            const hasDragIcon = node.id !== structureId;

            const labelFontSize = 20;
            const labelFont = `${labelFontSize}px 'Segoe UI', Arial, sans-serif`;
            const labelText = `${wbsPrefix}${node.name}`;
            const labelTextWidth = getTextWidth(labelText, labelFont);

            const dragIconWidth = 20;
            const gap = 10;
            const padding = 5;

            const estimatedWidth = hasDragIcon
              ? dragIconWidth + gap + labelTextWidth + padding
              : labelTextWidth + padding;

            const labelOffsetX = hasDragIcon
              ? (dragIconWidth + gap) / estimatedWidth
              : padding / estimatedWidth;
            const shouldHighlight =
              highlightedNodeId === node.id && !!currentSearchTerm;

            return {
              id: node.id,
              isExpanded: node.isExpanded,
              visible: node.visible,

              annotations: [
                ...(hasDragIcon
                  ? [
                      {
                        id: `drag-handle-${node.id}`,
                        content: "⠿",
                        offset: { x: 0, y: 0.5 },
                        horizontalAlignment: "Left",
                        verticalAlignment: "Center",
                        margin: { left: 8 },
                        style: {
                          color: "#333333",
                          fontSize: 20,
                        },
                      },
                    ]
                  : []),
                {
                  id: `label-${node.id}`,
                  content: labelText,
                  offset: {
                    x: labelOffsetX,
                    y: 0.5,
                  },
                  horizontalAlignment: "Left",
                  verticalAlignment: "Center",
                  margin: { left: 0, right: 0 },
                  width: labelTextWidth,
                  style: {
                    color: shouldHighlight ? "#fff" : "#000000",
                    fontSize: labelFontSize,
                    whiteSpace: "Normal",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  },
                },
              ],

              width: estimatedWidth,
              height: 40,
              style: {
                fill: shouldHighlight ? "#660000" : "#f8f8f8",
                strokeColor: "#ccc",
                strokeWidth: 1,
              },
              constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
              expandIcon: {
                shape: "Minus",
                width: 12,
                height: 12,
                horizontalAlignment: "Right",
                verticalAlignment: "Center",
                visible: hasAnyChildren && !node.isExpanded,
              },
              collapseIcon: {
                shape: "Plus",
                width: 12,
                height: 12,
                horizontalAlignment: "Right",
                verticalAlignment: "Center",
                visible: hasAnyChildren && node.isExpanded,
              },

              cornerRadius: 6,
              shadow: { angle: 45, distance: 5, opacity: 0.1 },
            };
          })}
          connectors={connectorsData}
          layout={LAYOUT_CONFIG}
          drop={onNodeDrop}
          click={handleDiagramClick}
          tool={DiagramTools.SingleSelect | DiagramTools.ZoomPan}
          selectionChange={onSelectionChange}
          expandStateChange={async (args) => {
            const isExpanded = args.state;
            const nodeId = args?.element?.id;

            if (!nodeId) return;

            const current = nodesMap[nodeId];
            if (!current || current.isExpanded === isExpanded) return;

            try {
              if (nodeId === structureId) {
                await dispatch(
                  updateStructureExpandState({ id: nodeId, isExpanded })
                ).unwrap();
              } else {
                await dispatch(
                  updateExpandState({ id: nodeId, isExpanded })
                ).unwrap();
              }

              await fetchStructure();
            } catch (error) {
              cogoToast.error(
                `Failed to update expand state for node ${nodeId}`
              );
            }
          }}
          getNodeDefaults={(node) => node}
        >
          <Inject services={[DataBinding, HierarchicalTree, UndoRedo]} />
        </DiagramComponent>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "rgba(255,255,255,0.95)",
          padding: "8px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          gap: "8px",
        }}
      >
        <ZoomToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </div>

      {isModalOpen && selectedNode && (
        <NodeModal
          position={modalPosition}
          onClose={closeModal}
          color={"#660000"}
          structureId={structureId}
          recordId={nodesMap[selectedNode?.id]?.recordId}
          parentId={
            nodesMap[selectedNode?.id]?.id === structureId
              ? null
              : nodesMap[selectedNode?.id]?.id
          }
          elementId={selectedNode?.id}
          wbs={generateWBSNumber(selectedNode?.id, nodesData, wbsStart)}
          structureName={nodesMap[structureId]?.name || "Structure"}
          onSuccess={() => {
            handleNodeUpdate();
          }}
        />
      )}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title="Move Node"
        content={`Do you want to reparent "${modalState.draggedNode?.name}" under "${modalState.targetNode?.name}"?`}
        onReparent={async () => {
          await dispatch(
            reparentElements({
              reparentingRequests: [
                {
                  sourceElementId: modalState.targetNode.id,
                  targetElementId: modalState.draggedNode.id,
                  attributes: { structureId },
                },
              ],
            })
          );
          setModalState({ isOpen: false, draggedNode: null, targetNode: null });
          cogoToast.success("Node reparented successfully.");
          await fetchStructure();
          dragInProgress.current = false;
        }}
        onReorder={async () => {
          const siblings = nodesData
            .filter((n) => n.parent === modalState.targetNode.parent)
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

          let insertIndex = siblings.findIndex(
            (n) => n.id === modalState.targetNode.id
          );
          if (insertIndex === -1) insertIndex = siblings.length;

          const reordered = siblings.filter(
            (n) => n.id !== modalState.draggedNode.id
          );
          reordered.splice(insertIndex, 0, modalState.draggedNode);

          for (let i = 0; i < reordered.length; i++) {
            const node = reordered[i];
            if (node.orderIndex !== i) {
              await dispatch(
                updateElementOrderIndex({ id: node.id, orderIndex: i })
              ).unwrap();
            }
          }

          setModalState({ isOpen: false, draggedNode: null, targetNode: null });
          cogoToast.success("Node reordered successfully.");
          await fetchStructure();
          dragInProgress.current = false;
        }}
        onClose={() => {
          setModalState({ isOpen: false, draggedNode: null, targetNode: null });
          dragInProgress.current = false;
        }}
      />

      {noResults && !isLoading && (
        <div className="absolute top-[15%] left-[37%] transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-50">
          No matching elements found.
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
        </div>
      )}
    </>
  );
};

export default Syncfusion;
