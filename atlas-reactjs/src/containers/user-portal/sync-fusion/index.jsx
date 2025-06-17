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
      };

      const flattenElements = (
        elements,
        parentId = null,
        parentExpanded = true
      ) => {
        let flatNodes = [];

        for (let element of elements) {
          const shouldRenderChildren = parentExpanded && element.isExpanded;
          const level = parentId ? getNodeLevel(parentId, nodesMap) + 1 : 0;

          flatNodes.push({
            id: element?.id,
            name: element?.name || "Unnamed",
            parent: parentId,
            isExpanded: element?.isExpanded ?? true,
            visible: parentExpanded,
            recordId: element?.recordId || null,
            level,
          });

          if (Array.isArray(element.children) && element.children.length > 0) {
            flatNodes.push(
              ...flattenElements(
                element.children,
                element.id,
                shouldRenderChildren
              )
            );
          }
        }

        return flatNodes;
      };

      const nodes = flattenElements(
        structure.elements,
        structure.id,
        structure?.isExpanded ?? true
      );
      const fullNodes = [rootNode, ...nodes];
      const visibleNodes = fullNodes.filter((n) => n.visible);
      const visibleNodeIds = new Set(
        fullNodes.filter((n) => n.visible).map((n) => n.id)
      );
      const connectors = createConnectors(fullNodes).filter(
        (conn) =>
          visibleNodeIds.has(conn.sourceID) && visibleNodeIds.has(conn.targetID)
      );

      setNodesData(fullNodes);
      setConnectorsData(connectors);
      setDiagramKey((prev) => prev + 1);
    } catch (err) {
      cogoToast.error("Failed to load structure");
    } finally {
      setIsLoading(false);
    }
  };

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
      const targetNodeId = args.target?.id;

      if (dragInProgress.current || !draggedNodeId || !targetNodeId) return;

      if (draggedNodeId === targetNodeId) return;

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

      dragInProgress.current = true;

      const reparentingRequest = {
        sourceElementId: isTargetRoot ? null : targetNodeId,
        targetElementId: draggedNodeId,
        attributes: {
          structureId,
        },
      };

      try {
        await dispatch(
          reparentElements({ reparentingRequests: [reparentingRequest] })
        ).unwrap();

        await fetchStructure();
        cogoToast.success("Element reparented successfully.");
      } catch (error) {
        cogoToast.error("Failed to reparent element.");
      } finally {
        setTimeout(() => {
          dragInProgress.current = false;
        }, 300);
      }
    },
    [dispatch, nodesData, structureId]
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

  const isNodeVisibleByExpandState = (nodeId) => {
    let current = nodesMap[nodeId];
    while (current?.parent) {
      const parent = nodesMap[current.parent];
      if (!parent?.isExpanded) return false;
      current = parent;
    }
    return true;
  };

  const handleSearch = (level, searchTerm) => {
    setSearchLoading(true);
    setCurrentSearchTerm(searchTerm);
    setNoResults(null);
    setHighlightedNodeId(null);

    const isLevelOnlySearch = level !== null && !searchTerm?.trim();

    if (!isLevelOnlySearch && !searchTerm?.trim()) {
      const visibleIds = new Set();

      const markVisible = (nodeId) => {
        const node = nodesMap[nodeId];
        if (!node) return;

        visibleIds.add(nodeId);
        if (node.isExpanded) {
          nodesData
            .filter((n) => n.parent === nodeId)
            .forEach((child) => markVisible(child.id));
        }
      };

      markVisible(structureId);

      const resetNodes = nodesData.map((n) => ({
        ...n,
        visible: visibleIds.has(n.id),
      }));

      setNodesData(resetNodes);

      const visibleNodes = resetNodes.filter((n) => n.visible);
      const connectors = createConnectors(visibleNodes).filter(
        (conn) =>
          visibleNodes.some((n) => n.id === conn.sourceID) &&
          visibleNodes.some((n) => n.id === conn.targetID)
      );
      setConnectorsData(connectors);

      setSearchLoading(false);
      setDiagramKey((prev) => prev + 1);
      return;
    }

    // STEP 1: Find matching node IDs
    const matchingNodes = nodesData.filter((n) => {
      const isLevelMatch = level !== null && searchTerm?.trim() === "";
      const levelMatch = level === null || n.level === level;
      const nameMatch = searchTerm
        ? n.name?.toLowerCase().includes(searchTerm.toLowerCase())
        : false;

      const matches = isLevelMatch ? levelMatch : nameMatch && levelMatch;

      return matches && isNodeVisibleByExpandState(n.id);
    });

    if (!matchingNodes.length) {
      setNoResults(true);
      setDiagramKey((prev) => prev + 1);
      setSearchLoading(false);
      return;
    }

    const visibleIds = new Set();

    const includeParents = (nodeId) => {
      visibleIds.add(nodeId);
      const parentId = nodesMap[nodeId]?.parent;
      if (parentId) includeParents(parentId);
    };

    for (const match of matchingNodes) {
      includeParents(match.id);
    }

    setHighlightedNodeId(matchingNodes[0].id);

    // STEP 3: Update node visibility
    const updated = nodesData.map((n) => ({
      ...n,
      visible: visibleIds.has(n.id),
    }));
    setNodesData(updated);

    const visibleNodes = updated.filter((n) => n.visible);
    const connectors = createConnectors(visibleNodes).filter(
      (conn) =>
        visibleNodes.some((n) => n.id === conn.sourceID) &&
        visibleNodes.some((n) => n.id === conn.targetID)
    );
    setDiagramKey((prev) => prev + 1);

    setConnectorsData(connectors);
  };

  const flattenFilteredTree = (node) => {
    if (!node) return [];
    const nodes = [{ ...node, visible: true }];
    (node.children || []).forEach((child) => {
      nodes.push(...flattenFilteredTree(child));
    });
    return nodes;
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
          nodes={nodesData
            .filter((n) => {
              const hasVisibleChild = nodesData.some(
                (child) => child.parent === n.id && child.visible
              );
              return n.visible || hasVisibleChild || n.id === structureId;
            })
            .map((node) => {
              const children = nodesData.filter((n) => n.parent === node.id);
              const hasAnyChildren = children.length > 0;
              const hasVisibleChildren = children.some((c) => c.visible);

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
                annotations: node.visible
                  ? [
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
                    ]
                  : [],

                width: estimatedWidth,
                height: 40,
                style: {
                  fill: shouldHighlight ? "#660000" : "#f8f8f8",
                  strokeColor: "#ccc",
                  strokeWidth: 1,
                },
                constraints:
                  NodeConstraints.Default | NodeConstraints.AllowDrop,
                expandIcon: {
                  shape: "Minus",
                  width: 12,
                  height: 12,
                  horizontalAlignment: "Right",
                  verticalAlignment: "Center",
                  visible: hasAnyChildren && !hasVisibleChildren,
                },
                collapseIcon: {
                  shape: "Plus",
                  width: 12,
                  height: 12,
                  horizontalAlignment: "Right",
                  verticalAlignment: "Center",
                  visible: hasAnyChildren && hasVisibleChildren,
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
          // expandStateChange={async (args) => {
          //   const isExpanded = args.state;
          //   const nodeId = args?.element?.id;

          //   if (!nodeId) return;

          //   try {
          //     if (nodeId === structureId) {
          //       await dispatch(
          //         updateStructureExpandState({ id: nodeId, isExpanded })
          //       ).unwrap();
          //     } else {
          //       await dispatch(
          //         updateExpandState({ id: nodeId, isExpanded })
          //       ).unwrap();
          //     }
          //   } catch (error) {
          //     cogoToast.error(
          //       `Failed to update expand state for node ${nodeId}`
          //     );
          //     console.error("Expand state update failed:", error);
          //   }
          // }}
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
