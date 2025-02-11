import cogoToast from "@successtar/cogo-toast";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useUndo from "use-undo";
import useMarkmapInteractions from "../../../hooks/useMarkmapInteractions";
import { reparentElements } from "../../../redux/slices/elements";
import { getStructure } from "../../../redux/slices/structures";
import {
  addNodeToTarget,
  assignWbsNumbers,
  isDescendant,
  removeNode,
  updateNodeLevels,
} from "../../../utils/markmapHelpers";
import NodeModal from "../../modals/NodeModal";
import RightClickMenu from "../../modals/RightClickMenu";
import { useMarkmap } from "../markmap-context/MarkmapContext";
import MarkmapHeader from "../markmap-layout/MarkmapHeader";

const MarkmapEditor = ({ structureId }) => {
  const dispatch = useDispatch();
  const { markmapInstance, svgRef } = useMarkmap();
  const [treeDataState, { set: setTreeData, undo, redo, canUndo, canRedo }] =
    useUndo(null);
  const treeData = treeDataState.present;
  const [isLoading, setIsLoading] = useState(true);
  const [draggedNode, setDraggedNode] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [shouldFitView, setShouldFitView] = useState(true);
  const [filteredTree, setFilteredTree] = useState(null);
  const [rightClickModal, setRightClickModal] = useState({
    visible: false,
    position: { x: 0, y: 0 },
  });

  const localStorageKey = "markmapTreeData";
  const localStorageWbsKey = "markmapShowWbs";

  const [showWbs, setShowWbsState] = useState(
    () => JSON.parse(localStorage.getItem(localStorageWbsKey)) ?? false
  );

  const setShowWbs = (value) => {
    setShowWbsState(value);
    localStorage.setItem(localStorageWbsKey, JSON.stringify(value));
  };

  const handleRightClick = (event) => {
    event.preventDefault();

    if (event.target.closest(".markmap-node, .markmap-header")) {
      return;
    }

    setRightClickModal({
      visible: true,
      position: { x: event.clientX, y: event.clientY },
    });
  };

  const handleLeftClick = (event) => {
    if (
      rightClickModal.visible &&
      !event.target.closest(".right-click-modal")
    ) {
      setRightClickModal({ visible: false, position: { x: 0, y: 0 } });
    }
  };

  const handleJsonChange = (e) => {
    try {
      const updatedTreeData = JSON.parse(e.target.value);
      const treeWithWbs = assignWbsNumbers(updatedTreeData);
      const treeWithLevels = updateNodeLevels(treeWithWbs);
      setTreeData(treeWithLevels);
      localStorage.setItem(localStorageKey, JSON.stringify(treeWithLevels));
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  const loadInitialTreeData = () => {
    const savedTreeData = localStorage.getItem(localStorageKey);
    if (savedTreeData) {
      try {
        const parsedTreeData = JSON.parse(savedTreeData);
        const treeWithWbs = assignWbsNumbers(parsedTreeData);
        return updateNodeLevels(treeWithWbs);
      } catch (error) {
        console.error("Failed to parse saved tree data:", error);
      }
    }

    // If nothing in localStorage, load default or structureId
    const content = structureId || "Default Structrue";
    return updateNodeLevels(assignWbsNumbers({ content, children: [] }));
  };

  /**
   * Moves draggedNodeData into targetNodeData's children
   */
  const updateTreeData = async (draggedNodeData, targetNodeData) => {
    if (!targetNodeData) {
      cogoToast.error("No valid target for the operation.");
      return;
    }

    if (isDescendant(draggedNodeData, targetNodeData.originalContent)) {
      cogoToast.error("Cannot move a node to one of its descendants.");
      return;
    }

    const reparentingRequest = {
      sourceElementId: targetNodeData.elementId,
      targetElementId: draggedNodeData.elementId,
      attributes: {
        structureId: structureId,
      },
    };

    try {
      await dispatch(
        reparentElements({ reparentingRequests: [reparentingRequest] })
      ).unwrap();

      fetchStructure(
        structureId,
        dispatch,
        setTreeData,
        setIsLoading,
        localStorageKey
      );

      cogoToast.success("Node reparented successfully.");

      // Update the tree data locally to reflect the reparenting
      const updatedTree = removeNode(treeData, draggedNodeData.originalContent);
      const newTree = addNodeToTarget(
        updatedTree,
        targetNodeData.originalContent,
        {
          ...draggedNodeData,
          children: draggedNodeData.children || [],
        }
      );

      const treeWithWbsAndLevels = updateNodeLevels(assignWbsNumbers(newTree));
      setTreeData(treeWithWbsAndLevels);
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(treeWithWbsAndLevels)
      );
    } catch (error) {
      console.error("Error during reparenting:", error);
      cogoToast.error("Failed to reparent node.");
    }
  };

  /**
   * For searching/filtering by level
   */
  const filterTreeByLevel = (node, level) => {
    if (!node) return null;

    // Check if the current node matches the level
    const matches = node.level === level;

    // Recursively filter children
    const filteredChildren = node.children
      ?.map((child) => filterTreeByLevel(child, level))
      .filter(Boolean);

    // Return node if it matches or has matching children
    if (matches || filteredChildren?.length) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  const handleSearch = (level) => {
    if (!level.trim()) {
      setFilteredTree(null);
      return;
    }

    const parsedLevel = parseInt(level, 10);

    if (isNaN(parsedLevel)) {
      cogoToast.error("Please enter a valid number");
      return;
    }

    const result = filterTreeByLevel(treeData, parsedLevel);
    if (result) {
      setFilteredTree(result);
    } else {
      setFilteredTree("no-results");
    }
  };

  // close the modal if user scrolls or zooms away so it doesn't float incorrectly
  useEffect(() => {
    if (modalData) {
      const handleInteraction = () => {
        const modalRect = {
          x: modalPosition.x,
          y: modalPosition.y,
          width: 200,
          height: 100,
        };

        const nodeElement = svgRef.current?.querySelector(
          ".markmap-node.active"
        );
        if (nodeElement) {
          const nodeRect = nodeElement.getBoundingClientRect();

          const intersects =
            nodeRect.left < modalRect.x + modalRect.width &&
            nodeRect.left + nodeRect.width > modalRect.x &&
            nodeRect.top < modalRect.y + modalRect.height &&
            nodeRect.top + nodeRect.height > modalRect.y;

          if (intersects) return;
        }

        setModalData(null);
      };

      window.addEventListener("scroll", handleInteraction);
      svgRef.current?.addEventListener("wheel", handleInteraction);

      return () => {
        window.removeEventListener("scroll", handleInteraction);
        svgRef.current?.removeEventListener("wheel", handleInteraction);
      };
    }
  }, [modalData, modalPosition, svgRef]);

  const fetchStructure = async (
    structureId,
    dispatch,
    setTreeData,
    setIsLoading,
    localStorageKey
  ) => {
    if (!structureId) return;

    try {
      const data = await dispatch(getStructure(structureId)).unwrap();
      const treeWithWbs = assignWbsNumbers({
        content: data.name,
        children: data.elements,
        structureId: data.id,
      });
      const treeWithLevels = updateNodeLevels(treeWithWbs);

      setTreeData(treeWithLevels);
      localStorage.setItem(localStorageKey, JSON.stringify(treeWithLevels));
    } catch (error) {
      console.error("Error fetching structure:", error);
      cogoToast.error("Failed to fetch structure data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure(
      structureId,
      dispatch,
      setTreeData,
      setIsLoading,
      localStorageKey
    );
  }, [structureId, dispatch, setTreeData, localStorageKey]);

  // Load initial tree data on mount
  useEffect(() => {
    const initialTreeData = loadInitialTreeData();
    setTreeData(initialTreeData);
    setShouldFitView(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  useMarkmapInteractions({
    treeData,
    markmapInstance,
    showWbs,
    filteredTree,
    draggedNode,
    shouldFitView,
    svgRef,
    setDraggedNode,
    setShouldFitView,
    setModalData,
    setModalPosition,
    updateTreeData,
  });

  const addChildNode = (parentContent, newChildContent) => {
    const addNode = (node) => {
      if (node.originalContent === parentContent) {
        return {
          ...node,
          children: [
            ...(node.children || []),
            {
              content: newChildContent,
              originalContent: newChildContent,
              children: [],
            },
          ],
        };
      }
      return {
        ...node,
        children: node.children ? node.children.map(addNode) : [],
      };
    };

    const updatedTree = addNode(treeData);
    const treeWithWbsAndLevels = updateNodeLevels(
      assignWbsNumbers(updatedTree)
    );
    setTreeData(treeWithWbsAndLevels);
    localStorage.setItem(localStorageKey, JSON.stringify(treeWithWbsAndLevels));
  };

  const deleteNode = (targetContent) => {
    const removeNode = (node) => {
      if (node.originalContent === targetContent) return null;

      return {
        ...node,
        children: node.children?.map(removeNode).filter(Boolean),
      };
    };

    const updatedTree = removeNode(treeData);
    const treeWithWbsAndLevels = updateNodeLevels(
      assignWbsNumbers(updatedTree)
    );
    setTreeData(treeWithWbsAndLevels);
    localStorage.setItem(localStorageKey, JSON.stringify(treeWithWbsAndLevels));
  };

  const sanitizeTreeData = (node) => {
    const cleanedNode = {
      content: node.name || node.content,
      children: node.children ? node.children.map(sanitizeTreeData) : [],
    };

    return cleanedNode;
  };

  const exportAsHtml = (treeData) => {
    const sanitizedData = sanitizeTreeData(treeData);

    const htmlContent = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Markmap Export</title>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          #mindmap {
            display: block;
            width: 100vw;
            height: 100vh;
          }
        </style>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/style.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.min.css"
        />
      </head>
      <body>
        <svg id="mindmap"></svg>
  
        <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.8/dist/browser/index.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/index.js"></script>
        <script
          src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js"
          defer
        ></script>
  
        <script>
          window.onload = function () {
            const data = ${JSON.stringify(sanitizedData, null, 2)};
            const markmapInstance = window.markmap.Markmap.create(
              "#mindmap",
              null,
              data
            );
          };
        </script>
      </body>
    </html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "markmap_export.html";
    link.click();
  };

  return (
    <div
      className="flex flex-col h-full p-0 bg-gray-100"
      style={{ userSelect: "none" }}
      onContextMenu={handleRightClick}
      onClick={handleLeftClick}
    >
      <div className="flex-1 border border-gray-300 rounded-md bg-white overflow-hidden">
        <MarkmapHeader
          onSuccess={() =>
            fetchStructure(
              structureId,
              dispatch,
              setTreeData,
              setIsLoading,
              localStorageKey
            )
          }
          showWbs={showWbs}
          structureId={structureId}
          setShowWbs={setShowWbs}
          undo={undo}
          redo={redo}
          onSearch={handleSearch}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <svg ref={svgRef} className="w-full h-full dotted-bg" />
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
          </div>
        )}
        {filteredTree === "no-results" && (
          <div className="absolute inset-0 dotted-bg flex items-center justify-center text-gray-500">
            No elements found.
          </div>
        )}
      </div>

      <textarea
        className="w-full h-40 hidden mt-4 border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring focus:border-blue-300"
        value={JSON.stringify(treeData, null, 2)}
        onChange={handleJsonChange}
        placeholder="Edit JSON data here..."
      />

      {modalData && (
        <NodeModal
          position={modalPosition}
          structureId={structureId}
          parentId={modalData.elementId}
          elementId={modalData.elementId}
          recordId={modalData.recordId}
          structureName={modalData.structureName}
          onClose={() => setModalData(null)}
          wbs={modalData.wbs}
          onAddChild={(newChildContent) =>
            addChildNode(modalData, newChildContent)
          }
          onDelete={() => deleteNode(modalData)}
          onSuccess={() =>
            fetchStructure(
              structureId,
              dispatch,
              setTreeData,
              setIsLoading,
              localStorageKey
            )
          }
          nodeData={modalData}
        />
      )}

      {/* right click modal */}
      {rightClickModal.visible && (
        <RightClickMenu
          position={rightClickModal.position}
          structureId={structureId}
          onClose={() =>
            setRightClickModal({ visible: false, position: { x: 0, y: 0 } })
          }
          onOptionSelect={(option) => {
            if (option !== "moveToTrash") {
              setRightClickModal({ visible: false, position: { x: 0, y: 0 } });
            }
            if (option === "exportHtml") {
              exportAsHtml(treeData);
            }
          }}
        />
      )}
    </div>
  );
};

export default MarkmapEditor;
