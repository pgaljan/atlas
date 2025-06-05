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

const getTextWidth = (text, font = "20px Arial") => {
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
  const [showWbs, setShowWbsState] = useState(false);
  const [nodesData, setNodesData] = useState([]);
  const [connectorsData, setConnectorsData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 100, y: 100 });
  const [isLoading, setIsLoading] = useState(true);
  const [diagramKey, setDiagramKey] = useState(0);
  const [filteredNodes, setFilteredNodes] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchStructure = async () => {
    setIsLoading(true);
    try {
      const structure = await dispatch(getStructure(structureId)).unwrap();

      setShowWbsState(structure.markmapShowWbs);

      const rootNode = {
        id: structure?.id,
        name: structure?.name || "Main",
        parent: null,
        isExpanded: structure?.isExpanded ?? true,
        visible: true,
      };

      const flattenElements = (
        elements,
        parentId = null,
        parentExpanded = true
      ) => {
        let flatNodes = [];

        for (let element of elements) {
          const shouldRenderChildren = parentExpanded && element.isExpanded;

          flatNodes.push({
            id: element?.id,
            name: element?.name || "Unnamed",
            parent: parentId,
            isExpanded: element?.isExpanded ?? true,
            visible: parentExpanded,
            recordId: element?.recordId || null,
          });

          // console.table(
          //   flatNodes.map((n) => ({
          //     id: n.id,
          //     name: n.name,
          //     isExpanded: n.isExpanded,
          //     visible: n.visible,
          //   }))
          // );

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
      const connectors = createConnectors(visibleNodes);

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

      const draggedNodeId = args.element.id;
      const targetNodeId = args.target.id;

      if (dragInProgress.current) return;

      if (
        draggedNodeId !== targetNodeId &&
        !isDescendant(draggedNodeId, targetNodeId, nodesData)
      ) {
        dragInProgress.current = true;

        const reparentingRequest = {
          sourceElementId: targetNodeId,
          targetElementId: draggedNodeId,
          attributes: {
            structureId: structureId,
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
      }
    },
    [dispatch, nodesData, structureId]
  );

  const filterTreeByCriteria = (node, nodesMap, level, searchTerm) => {
    if (!node) return null;

    const matchesLevel =
      level !== null && getNodeLevel(node?.id, nodesMap) === level;
    const lowerSearch = searchTerm?.toLowerCase();
    const matchesText = lowerSearch
      ? node?.name?.toLowerCase().includes(lowerSearch)
      : false;

    const children = Object.values(nodesMap).filter(
      (n) => n.parent === node?.id
    );
    const filteredChildren = children
      .map((child) => filterTreeByCriteria(child, nodesMap, level, searchTerm))
      .filter(Boolean);

    return matchesLevel || matchesText || filteredChildren.length
      ? { ...node, children: filteredChildren }
      : null;
  };

  const handleSearch = (level, searchTerm) => {
    setSearchLoading(true);
    const root = nodesMap[structureId];
    const result =
      level === null && !searchTerm?.trim()
        ? null
        : filterTreeByCriteria(root, nodesMap, level, searchTerm) ||
          "no-results";

    setSearchLoading(false);
    setFilteredNodes(result);
  };

  const flattenFilteredTree = (node) => {
    if (!node) return [];
    const nodes = [{ ...node, visible: true }];
    (node.children || []).forEach((child) => {
      nodes.push(...flattenFilteredTree(child));
    });
    return nodes;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <MarkmapHeader
            onSuccess={fetchStructure}
            structureId={structureId}
            showWbs={showWbs}
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
          nodes={(filteredNodes === "no-results"
            ? []
            : filteredNodes
            ? flattenFilteredTree(filteredNodes)
            : nodesData
          )
            .filter((n) => n.visible)
            .map((node) => {
              const children = nodesData.filter((n) => n.parent === node.id);
              const hasAnyChildren = children.length > 0;
              const hasVisibleChildren = children.some((c) => c.visible);

              const wbsPrefix = showWbs
                ? `${generateWBSNumber(node.id, nodesData)} - `
                : "";
              const labelText = `${wbsPrefix}${node.name}`;

              const estimatedWidth = getTextWidth(labelText);

              return {
                id: node.id,
                annotations: [
                  {
                    content: labelText,
                    style: {
                      color: "#333",
                      fontSize: 20,
                    },
                  },
                ],
                width: estimatedWidth,
                height: 60,
                style: {
                  fill: "transparent",
                  strokeColor: "transparent",
                },
                constraints:
                  NodeConstraints.Default | NodeConstraints.AllowDrop,
                expandIcon: {
                  shape: "Plus",
                  width: 12,
                  height: 12,
                  visible: hasAnyChildren && !hasVisibleChildren,
                },
                collapseIcon: {
                  shape: "Minus",
                  width: 12,
                  height: 12,
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
          expandStateChange={async (args) => {
            const isExpanded = args.state;
            const nodeId = args?.element?.id;

            if (!nodeId) return;

            try {
              if (nodeId === structureId) {
                // Only the root node (structure itself)
                await dispatch(
                  updateStructureExpandState({ id: nodeId, isExpanded })
                ).unwrap();
              } else {
                // All other nodes (elements)
                await dispatch(
                  updateExpandState({ id: nodeId, isExpanded })
                ).unwrap();
              }
            } catch (error) {
              cogoToast.error(
                `Failed to update expand state for node ${nodeId}`
              );
              console.error("Expand state update failed:", error);
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
          wbs={generateWBSNumber(selectedNode?.id, nodesData)}
          structureName={nodesMap[structureId]?.name || "Structure"}
          onSuccess={() => {
            handleNodeUpdate();
          }}
        />
      )}

      {filteredNodes === "no-results" && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-50 bg-white bg-opacity-75">
          No elements found.
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
