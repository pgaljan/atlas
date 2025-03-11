import * as d3 from "d3";
import { useEffect } from "react";
import {
  isDescendant,
  resetDraggedElement,
  treeToMarkmapData,
} from "../utils/markmapHelpers";

/**
 * Custom hook to set up Markmap interactions (hover, click, drag/drop).
 */
export default function useMarkmapInteractions({
  treeData,
  markmapInstance,
  showWbs,
  filteredTree,
  draggedNode,
  setDraggedNode,
  shouldFitView,
  setShouldFitView,
  setModalData,
  setModalPosition,
  svgRef,
  updateTreeData,
}) {
  useEffect(() => {
    if (!markmapInstance) return;

    // Decide which data to render (filtered or full)
    const dataToRender =
      filteredTree === "no-results" ? null : filteredTree || treeData;

    if (!dataToRender) {
      markmapInstance.setData({ name: "No results" });
      markmapInstance.fit();
      return;
    }

    // Render Markmap data
    const markmapData = treeToMarkmapData(dataToRender, showWbs);
    markmapInstance?.setData(markmapData);

    // Fit view if requested
    if (shouldFitView) {
      markmapInstance.fit();
      setShouldFitView(false);
    }

    // Reference to track the currently highlighted (hovered) drop target
    let currentlyHighlighted = null;
    const nodes = markmapInstance.svg.selectAll("g.markmap-node");

    // Create tooltip element (for full name display)
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.75)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "5px")
      .style("font-size", "14px")
      .style("white-space", "nowrap")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Attach mouse events for tooltip and hover highlight
    nodes
      .on("mouseover", function (event, d) {
        d3.select(this).classed("hovered", true);
        const nodeText = d.originalContent || d.content;
         // Show tooltip ONLY if the node is NOT the root and its rendered content includes an ellipsis.
         if (d.level !== 0 && d.content && d.content.includes("...")) {
        tooltip
          .text(nodeText)
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
         }
         else {
          tooltip.style("opacity", 0);
         }
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).classed("hovered", false);
        tooltip.style("opacity", 0);
      });

    // Click event for node selection
    nodes.on("click", function (event, d) {
      event.stopPropagation();

      const target = event.target;
      const isCircle = target.tagName === "circle";

      if (isCircle) {
        d.state.collapsed = !d.state.collapsed;
        markmapInstance.updateTreeData(treeToMarkmapData(treeData, showWbs));
        return;
      }

      const nodePosition = d3.select(this).node().getBoundingClientRect();
      setModalPosition({
        x: nodePosition.x + nodePosition.width / 2,
        y: nodePosition.y,
      });

      setModalData({
        content: d.content,
        structureId: d.structureId,
        structureName: d.originalContent,
        elementId: d.elementId,
        parentId: d.parentId,
        recordId: d.recordId,
        wbs: d.wbs,
      });

      nodes.classed("active", false);
      d3.select(this).classed("active", true);
    });

    // Append drag icon to each node
    nodes.each(function (d) {
      if (d.state && d.state.id === 1) return;

      d3
        .select(this)
        .append("svg")
        .attr("class", "drag-icon")
        .attr("viewBox", "0 0 25 25")
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", -8)
        .attr("y", 2)
        .style("cursor", "grab")
        .on("click", (event) => event.stopPropagation())
        .html(`
          <g>
            <!-- Transparent background for interaction -->
            <rect width="25" height="25" fill="transparent" />
            <!-- Actual icon -->
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M9.5 8C10.3284 8 11 7.32843 11 6.5C11 5.67157 10.3284 5 9.5 5C8.67157 5 8 5.67157 8 6.5C8 7.32843 8.67157 8 9.5 8ZM9.5 14C10.3284 14 11 13.3284 11 12.5C11 11.6716 10.3284 11 9.5 11C8.67157 11 8 11.6716 8 12.5C8 13.3284 8.67157 14 9.5 14ZM11 18.5C11 19.3284 10.3284 20 9.5 20C8.67157 20 8 19.3284 8 18.5C8 17.6716 8.67157 17 9.5 17C10.3284 17 11 17.6716 11 18.5ZM15.5 8C16.3284 8 17 7.32843 17 6.5C17 5.67157 16.3284 5 15.5 5C14.6716 5 14 5.67157 14 6.5C14 7.32843 14.6716 8 15.5 8ZM17 12.5C17 13.3284 16.3284 14 15.5 14C14.6716 14 14 13.3284 14 12.5C14 11.6716 14.6716 11 15.5 11C16.3284 11 17 11.6716 17 12.5ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.6716 20 15.5 20Z"
              fill="#000"
            ></path>
          </g>
        `);
    });

    // Drag-and-drop handlers
    nodes.call(
      d3
        .drag()
        .on("start", function (event, d) {
          const svgRect = svgRef.current.getBoundingClientRect();
          const node = d3.select(this);

          const originalTransform = node.attr("transform") || "translate(0,0)";
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

          const dropTargets = d3.selectAll("g.markmap-node");

          // Find valid drop targets
          const validTargets = dropTargets.filter(function () {
            const bbox = this.getBoundingClientRect();
            const isWithinX =
              event.sourceEvent.clientX >= bbox.left &&
              event.sourceEvent.clientX <= bbox.right;
            const isWithinY =
              event.sourceEvent.clientY >= bbox.top &&
              event.sourceEvent.clientY <= bbox.bottom;

            // Exclude the node currently being dragged
            return (
              isWithinX &&
              isWithinY &&
              this !== event.sourceEvent.target &&
              this !== d3.select(this).node()
            );
          });

          if (validTargets.size() > 0) {
            const closestTarget = validTargets.nodes()[0];

            if (currentlyHighlighted !== closestTarget) {
              // Remove highlight from previously highlighted
              if (currentlyHighlighted) {
                d3.select(currentlyHighlighted).classed(
                  "highlight-target",
                  false
                );
              }
              currentlyHighlighted = closestTarget;
              d3.select(closestTarget)
                .classed("highlight-target", true)
                .raise();
            }
          } else {
            if (currentlyHighlighted) {
              d3.select(currentlyHighlighted).classed(
                "highlight-target",
                false
              );
              currentlyHighlighted = null;
            }
          }
        })
        .on("end", function (event) {
          if (!draggedNode) return;

          const draggedElement = d3.select(this);
          const dropTargets = d3.selectAll("g.markmap-node");

          // Remove highlight if any
          if (currentlyHighlighted) {
            d3.select(currentlyHighlighted).classed("highlight-target", false);
            currentlyHighlighted = null;
          }

          // Filter valid targets
          const validTargets = dropTargets.filter(function () {
            const bbox = this.getBoundingClientRect();
            // Exclude the node being dragged itself
            if (this === draggedElement.node()) return false;

            return (
              event.sourceEvent.clientX >= bbox.left &&
              event.sourceEvent.clientX <= bbox.right &&
              event.sourceEvent.clientY >= bbox.top &&
              event.sourceEvent.clientY <= bbox.bottom
            );
          });

          // If there's a valid drop target, move the node in the data structure
          if (validTargets.size() > 0) {
            const closestTarget = validTargets.nodes()[0];
            const targetNode = d3.select(closestTarget).datum();

            const draggedNodeContent = draggedNode.data.originalContent;
            const targetNodeContent = targetNode.originalContent;

            if (
              targetNodeContent !== draggedNodeContent &&
              !isDescendant(draggedNode.data, targetNodeContent)
            ) {
              updateTreeData(draggedNode.data, targetNode);
            } else {
              resetDraggedElement(this);
            }
          } else {
            // No valid target => reset
            resetDraggedElement(this);
          }

          setDraggedNode(null);
        })
    );

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [
    treeData,
    markmapInstance,
    showWbs,
    filteredTree,
    draggedNode,
    shouldFitView,
    setShouldFitView,
    setDraggedNode,
    setModalData,
    setModalPosition,
    svgRef,
    updateTreeData,
  ]);
}
