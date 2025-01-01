import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { useMarkmap } from "../markmap-context/MarkmapContext";
import MarkmapHeader from "../markmap-layout/MarkmapHeader";
import NodeModal from "../../modals/NodeModal";

const MarkmapEditor = () => {
  const { markmapInstance, svgRef } = useMarkmap();
  const [treeData, setTreeData] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const localStorageKey = "markmapTreeData";
  const localStorageWbsKey = "markmapShowWbs";

  const [showWbs, setShowWbsState] = useState(
    () => JSON.parse(localStorage.getItem(localStorageWbsKey)) ?? false
  );

  const setShowWbs = (value) => {
    setShowWbsState(value);
    localStorage.setItem(localStorageWbsKey, JSON.stringify(value));
  };

  // Assign WBS numbers dynamically to each node in the tree
  const assignWbsNumbers = (node, prefix = "1") => {
    if (!node) return null;

    const wbsNode = {
      ...node,
      wbs: prefix,
    };

    if (node.children) {
      wbsNode.children = node.children.map((child, index) =>
        assignWbsNumbers(child, `${prefix}.${index + 1}`)
      );
    }

    return wbsNode;
  };

  const handleJsonChange = (e) => {
    try {
      const updatedTreeData = JSON.parse(e.target.value);
      const treeWithWbs = assignWbsNumbers(updatedTreeData);
      setTreeData(treeWithWbs);
      localStorage.setItem(localStorageKey, JSON.stringify(treeWithWbs));
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  const treeToMarkmapData = (node) => {
    if (!node) return null;
    const { content, wbs, children = [] } = node;

    // Prepend WBS number to the node content based on the toggle state
    const updatedContent =
      showWbs && wbs !== "1" ? `${wbs} - ${content}` : content;

    return {
      content: updatedContent,
      children: children.map(treeToMarkmapData),
    };
  };

  const loadInitialTreeData = () => {
    const savedTreeData = localStorage.getItem(localStorageKey);
    if (savedTreeData) {
      try {
        const parsedTreeData = JSON.parse(savedTreeData);
        return assignWbsNumbers(parsedTreeData);
      } catch (error) {
        console.error("Failed to parse saved tree data:", error);
      }
    }

    // Fallback to default tree structure if no data in localStorage
    const content = "Default Content";
    return assignWbsNumbers({
      content,
      children: [],
    });
  };

  useEffect(() => {
    const initialTreeData = loadInitialTreeData();
    setTreeData(initialTreeData);
  }, []);

  const updateTreeData = (draggedNodeData, targetNodeData) => {
    if (!targetNodeData) {
      console.log("No valid target. Operation aborted.");
      return;
    }

    // Helper function to remove the dragged node from its current location
    const removeNode = (node) => {
      if (!node.children) return node;

      return {
        ...node,
        children: node.children
          .map(removeNode)
          .filter((child) => child.content !== draggedNodeData.content),
      };
    };

    const addNodeToTarget = (node) => {
      if (node.content === targetNodeData.content) {
        return {
          ...node,
          children: [
            ...(node.children || []),
            { ...draggedNodeData, children: draggedNodeData.children || [] },
          ],
        };
      }

      return {
        ...node,
        children: node.children ? node.children.map(addNodeToTarget) : [],
      };
    };

    if (targetNodeData) {
      let updatedTree = removeNode(treeData);

      updatedTree = addNodeToTarget(updatedTree);

      const treeWithUpdatedWbs = assignWbsNumbers(updatedTree);

      setTreeData(treeWithUpdatedWbs);
      localStorage.setItem(localStorageKey, JSON.stringify(treeWithUpdatedWbs));
    }
  };

  useEffect(() => {
    if (markmapInstance && treeData) {
      const markmapData = treeToMarkmapData(treeData);
      markmapInstance.setData(markmapData);
      markmapInstance.fit();
    }
  }, [treeData, markmapInstance]);

  useEffect(() => {
    const updateNodeEventListeners = () => {
      if (!markmapInstance) return;

      const nodes = markmapInstance.svg.selectAll("g.markmap-node");
      nodes
        .on("mouseover", null)
        .on("mouseout", null)
        .on("drag", null)
        .on("click", null);

      nodes.on("mouseover", function () {
        d3.select(this).classed("hovered", true);
      });

      nodes.on("mouseout", function () {
        d3.select(this).classed("hovered", false);
      });

      nodes.on("click", function (event, d) {
        const nodePosition = d3.select(this).node().getBoundingClientRect();
        setModalPosition({
          x: nodePosition.x + nodePosition.width / 2,
          y: nodePosition.y,
        });
        setModalData(d.content);
        nodes.classed("active", false);
        d3.select(this).classed("active", true);
      });

      nodes.each(function (d) {
        if (d.state && d.state.id === 1) return;

        d3.select(this)
          .append("circle")
          .attr("class", "drag-icon")
          .attr("r", 6)
          .attr("cx", 20)
          .attr("cy", 0)
          .style("fill", "#007bff")
          .style("cursor", "grab");
      });

      nodes.call(
        d3
          .drag()
          .on("start", function (event, d) {
            const svgRect = svgRef.current.getBoundingClientRect();
            const node = d3.select(this);

            const originalTransform =
              node.attr("transform") || "translate(0,0)";
            node.attr("original-transform", originalTransform);

            const transform = originalTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX =
              transform && transform[1] ? parseFloat(transform[1]) : 0;
            const currentY =
              transform && transform[2] ? parseFloat(transform[2]) : 0;

            setDraggedNode({
              data: d,
              startX: event.x - svgRect.left - currentX,
              startY: event.y - svgRect.top - currentY,
            });
          })
          .on("drag", function (event) {
            if (!draggedNode) return;

            const svgRect = svgRef.current.getBoundingClientRect();
            const newX = event.x - svgRect.left - draggedNode.startX;
            const newY = event.y - svgRect.top - draggedNode.startY;

            d3.select(this).attr("transform", `translate(${newX}, ${newY})`);
          })
          .on("end", function (event) {
            if (!draggedNode) return;

            const dropTarget = d3.select(
              event.sourceEvent.target.closest("g.markmap-node")
            );
            const targetNode = dropTarget.datum();

            if (targetNode && draggedNode && targetNode !== draggedNode.data) {
              updateTreeData(draggedNode.data, targetNode);
            } else {
              const draggedElement = d3.select(this);
              const originalTransform =
                draggedElement.attr("original-transform");
              if (originalTransform) {
                draggedElement.attr("transform", originalTransform);
              }
            }
            setDraggedNode(null);
          })
      );
    };

    if (markmapInstance) {
      markmapInstance.setData(treeToMarkmapData(treeData));
      markmapInstance.fit();

      setTimeout(updateNodeEventListeners, 0);
    }
  }, [treeData, markmapInstance, showWbs, draggedNode]);

  return (
    <div
      className="flex flex-col h-full p-0 bg-gray-100"
      style={{ userSelect: "none" }}
    >
      <div className="flex-1 border border-gray-300 rounded-md bg-white overflow-hidden">
        <MarkmapHeader showWbs={showWbs} setShowWbs={setShowWbs} />
        <svg
          ref={svgRef}
          className="w-full h-full dotted-bg"
          style={{
            display: "block",
            overflow: "visible",
          }}
        />
      </div>

      <textarea
        className="w-full h-40 mt-4 border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring focus:border-blue-300"
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
