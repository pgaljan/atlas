import cogoToast from "@successtar/cogo-toast";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import useUndo from "use-undo";
import useCaptureAndUploadSnapshot from "../../../hooks/useCaptureAndUploadSnapshot";
import useMarkmapInteractions from "../../../hooks/useMarkmapInteractions";
import { reparentElements } from "../../../redux/slices/elements";
import {
  getStructure,
  updateStructure,
} from "../../../redux/slices/structures";
import {
  exportAsDoc,
  exportAsHtml,
  exportAsPdf,
} from "../../../utils/exportFunctions";
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
  const [showWbs, setShowWbsState] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [draggedNode, setDraggedNode] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [savedTreeData, setSavedTreeData] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [shouldFitView, setShouldFitView] = useState(true);
  const [filteredTree, setFilteredTree] = useState(null);
  const [loaderSearch, setLoaderSearch] = useState(false);
  const [rightClickModal, setRightClickModal] = useState({
    visible: false,
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    const handleAutoSave = async () => {
      if (svgRef.current) {
        await useCaptureAndUploadSnapshot(
          svgRef.current,
          structureId,
          dispatch
        );
      }
    };

    const debounceTimer = setTimeout(handleAutoSave, 2000);

    return () => clearTimeout(debounceTimer);
  }, [structureId]);

  const setShowWbs = async (value) => {
    setShowWbsState(value);

    try {
      await dispatch(
        updateStructure({
          id: structureId,
          updateData: { markmapShowWbs: value },
        })
      ).unwrap();
    } catch (error) {
      cogoToast.error("Failed to toggle WBS visibility.");
    }
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

  const loadInitialTreeData = () => {
    if (treeData) {
      try {
        const parsedTreeData = JSON.parse(savedTreeData);
        const treeWithWbs = assignWbsNumbers(parsedTreeData);
        return updateNodeLevels(treeWithWbs);
      } catch (error) {
        console.error("Failed to parse saved tree data:", error);
      }
    }

    // If nothing in localStorage, load default or structureId
    return updateNodeLevels(assignWbsNumbers({ children: [] }));
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
      sourceElementId: targetNodeData.elementId
        ? targetNodeData.elementId
        : null,
      targetElementId: draggedNodeData.elementId,
      attributes: {
        structureId: structureId ? structureId : null,
      },
    };

    try {
      await dispatch(
        reparentElements({ reparentingRequests: [reparentingRequest] })
      ).unwrap();

      fetchStructure(structureId, dispatch, setTreeData, setIsLoading);

      cogoToast.success("Element reparented successfully.");
      
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
    } catch (error) {
      cogoToast.error("Failed to reparent element.");
    }
  };

  const filterTreeByCriteria = (node, level, searchTerm) => {
    if (!node) return null;
    const matchesLevel = level !== null && node.level === level;
    const lowerSearch = searchTerm?.toLowerCase();
    const matchesText = lowerSearch
      ? node.name?.toLowerCase().includes(lowerSearch) ||
        node.content?.toLowerCase().includes(lowerSearch)
      : false;
    const filteredChildren = node.children
      ?.map((child) => filterTreeByCriteria(child, level, lowerSearch))
      ?.filter(Boolean);
    return matchesLevel || matchesText || filteredChildren?.length
      ? { ...node, children: filteredChildren }
      : null;
  };

  const handleSearch = (level, searchTerm) => {
    const result =
      level === null && !searchTerm?.trim()
        ? null
        : filterTreeByCriteria(treeData, level, searchTerm) || "no-results";
    setLoaderSearch(false);
    setFilteredTree(result);
  };

  // Flatten tree for faster lookups
  const flattenTree = useCallback((node, map = {}) => {
    if (!node) return map;
    map[node.originalContent] = node;
    node.children?.forEach((child) => flattenTree(child, map));
    return map;
  }, []);

  const treeMap = useMemo(() => flattenTree(treeData), [treeData, flattenTree]);

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
    setIsLoading
  ) => {
    if (!structureId) return;

    try {
      const data = await dispatch(getStructure(structureId)).unwrap();
      const treeWithWbs = assignWbsNumbers({
        content: data.name,
        children: data.elements,
        structureId: data.id,
      });
      setShowWbsState(data.markmapShowWbs);
      const treeWithLevels = updateNodeLevels(treeWithWbs);

      setTreeData(treeWithLevels);
    } catch (error) {
      cogoToast.error("Failed to fetch structure data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure(structureId, dispatch, setTreeData, setIsLoading);
  }, [structureId, dispatch, setTreeData]);

  // Load initial tree data on mount
  const initialTreeData = useMemo(() => {
    return loadInitialTreeData();
  }, [structureId]);

  useEffect(() => {
    setTreeData(initialTreeData);
    setShouldFitView(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [initialTreeData]);

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
  };

  const sanitizeTreeData = (node) => {
    const cleanedNode = {
      content: node.name || node.content,
      children: node.children ? node.children.map(sanitizeTreeData) : [],
    };

    return cleanedNode;
  };

  const handleExportOption = (option) => {
    if (option === "exportHtml") {
      exportAsHtml(treeData);
    } else if (option === "exportDoc") {
      exportAsDoc(treeData);
    } else if (option === "exportPdf") {
      exportAsPdf(treeData);
    }
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
            fetchStructure(structureId, dispatch, setTreeData, setIsLoading)
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

        {(isLoading || loaderSearch) && (
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
            fetchStructure(structureId, dispatch, setTreeData, setIsLoading)
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
            setRightClickModal({ visible: false, position: { x: 0, y: 0 } });
            handleExportOption(option);
          }}
        />
      )}
    </div>
  );
};

export default MarkmapEditor;
