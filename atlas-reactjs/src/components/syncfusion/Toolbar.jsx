const ZoomToolbar = ({ onZoomIn, onZoomOut }) => {
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
    </div>
  );
};

export default ZoomToolbar;
