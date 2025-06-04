// import { ToolbarComponent } from "@syncfusion/ej2-react-navigations";

// const Toolbar = ({ diagramRef }) => {
//   const items = [
//     { text: "New" },
//     { text: "Open" },
//     { text: "Save" },
//     { type: "Separator" },
//     {
//       prefixIcon: "e-undo e-icons",
//       tooltipText: "Undo",
//       click: () => diagramRef.current?.undo(),
//     },
//     {
//       prefixIcon: "e-redo e-icons",
//       tooltipText: "Redo",
//       click: () => diagramRef.current?.redo(),
//     },
//     { type: "Separator" },
//     {
//       prefixIcon: "e-zoom-in e-icons",
//       tooltipText: "Zoom In",
//       click: () =>
//         diagramRef.current?.zoomTo({ type: "ZoomIn", zoomFactor: 0.2 }),
//     },
//     {
//       prefixIcon: "e-zoom-out e-icons",
//       tooltipText: "Zoom Out",
//       click: () =>
//         diagramRef.current?.zoomTo({ type: "ZoomOut", zoomFactor: 0.2 }),
//     },
//     { type: "Separator" },
//     {
//       prefixIcon: "e-exit-full-screen e-icons",
//       tooltipText: "Fit To Screen",
//       click: () => diagramRef.current?.fitToPage(),
//     },
//     {
//       prefixIcon: "e-full-screen e-icons",
//       tooltipText: "Toggle Full Screen",
//       click: () => {
//         const container = diagramRef.current?.element?.parentElement;
//         if (container) {
//           document.fullscreenElement
//             ? document.exitFullscreen()
//             : container.requestFullscreen();
//         }
//       },
//     },
//   ];

//   return <ToolbarComponent items={items} />;
// };

// export default Toolbar;
import React from "react";

const ZoomToolbar = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute bottom-5 right-5 bg-white shadow-lg rounded-lg flex gap-4 px-4 py-2 z-10 select-none">
      <button
        onClick={onZoomIn}
        title="Zoom In"
        className="border-none bg-transparent text-xl cursor-pointer select-none"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        title="Zoom Out"
        className="border-none bg-transparent text-xl cursor-pointer select-none"
      >
        −
      </button>
      {/* <button
        onClick={onReset}
        title="Reset Zoom"
        className="border-none bg-transparent text-lg cursor-pointer select-none"
      >
        ⟲
      </button> */}
    </div>
  );
};

export default ZoomToolbar;
