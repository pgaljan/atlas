import cogoToast from "@successtar/cogo-toast";
import React, { useEffect, useState } from "react";
import useUndo from "use-undo";
import {
  addNodeToTarget,
  assignWbsNumbers,
  isDescendant,
  removeNode,
  updateNodeLevels,
} from "../../../utils/markmapHelpers";
import NodeModal from "../../modals/NodeModal";
import { useMarkmap } from "../markmap-context/MarkmapContext";
import MarkmapHeader from "../markmap-layout/MarkmapHeader";

import useMarkmapInteractions from "../../../hooks/useMarkmapInteractions";

const MarkmapEditor = ({ initialContent }) => {
  const { markmapInstance, svgRef } = useMarkmap();

  const [treeDataState, { set: setTreeData, undo, redo, canUndo, canRedo }] =
    useUndo(null);
  const treeData = treeDataState.present;

  const [draggedNode, setDraggedNode] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [shouldFitView, setShouldFitView] = useState(true);
  const [filteredTree, setFilteredTree] = useState(null);

  const localStorageKey = "markmapTreeData";
  const localStorageWbsKey = "markmapShowWbs";

  const [showWbs, setShowWbsState] = useState(
    () => JSON.parse(localStorage.getItem(localStorageWbsKey)) ?? false
  );

  const setShowWbs = (value) => {
    setShowWbsState(value);
    localStorage.setItem(localStorageWbsKey, JSON.stringify(value));
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

    // If nothing in localStorage, load default or initialContent
    const content = initialContent || "Default Structrue";
    return updateNodeLevels(assignWbsNumbers({ content, children: [] }));
  };

  /**
   * Moves draggedNodeData into targetNodeData's children
   */
  const updateTreeData = (draggedNodeData, targetNodeData) => {
    if (!targetNodeData) {
      cogoToast.error("No valid target for the operation.");
      return;
    }

    if (isDescendant(draggedNodeData, targetNodeData.originalContent)) {
      cogoToast.error("Cannot move a node to one of its descendants.");
      return;
    }

    // Remove the dragged node from its original location
    const updatedTree = removeNode(treeData, draggedNodeData.originalContent);

    // Add the dragged node as a child of the drop target
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
    localStorage.setItem(localStorageKey, JSON.stringify(treeWithWbsAndLevels));
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

  // Close the modal if user scrolls or zooms away so it doesn't float incorrectly
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

  // Load initial tree data on mount
  useEffect(() => {
    const initialTreeData = loadInitialTreeData();
    setTreeData(initialTreeData);
    setShouldFitView(true);
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

  return (
    <div
      className="flex flex-col h-full p-0 bg-gray-100"
      style={{ userSelect: "none" }}
    >
      <div className="flex-1 border border-gray-300 rounded-md bg-white overflow-hidden">
        <MarkmapHeader
          showWbs={showWbs}
          setShowWbs={setShowWbs}
          undo={undo}
          redo={redo}
          onSearch={handleSearch}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <svg ref={svgRef} className="w-full h-full dotted-bg" />
        {filteredTree === "no-results" && (
          <div className="absolute inset-0 dotted-bg flex items-center justify-center text-gray-500">
            No records found.
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
          content={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
};

export default MarkmapEditor;
