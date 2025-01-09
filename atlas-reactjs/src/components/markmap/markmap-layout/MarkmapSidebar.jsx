import React from "react";
import Icons from "../../../constants/icons";

const MarkmapSidebar = () => {
  return (
    <div className="fixed top-1/2 left-6 transform -translate-y-1/2 h-auto w-14 bg-custom-main flex flex-col items-center py-2 space-y-4 rounded-lg z-50">
      <button className="p-2 text-white hover:bg-custom-main" aria-label="Undo">
        <div className="w-6 h-6">
          <Icons.TemplatesIcon />
        </div>
      </button>
      <button className="p-2 text-white hover:bg-custom-main" aria-label="Redo">
        <div className="w-6 h-6">
          <Icons.StickyNotesIcon />
        </div>
      </button>
      <button
        className="p-2 text-white hover:bg-custom-main"
        aria-label="Comments"
      >
        <div className="w-6 h-6">
          <Icons.ShapesIcon />
        </div>
      </button>

      <button className="p-2 text-white hover:bg-custom-main" aria-label="Outline">
        <div className="w-6 h-6">
          <Icons.ImagesIcon />
        </div>
      </button>
      <button className="p-2 text-white hover:bg-custom-main" aria-label="Outline">
        <div className="w-6 h-6">
          <Icons.ClickMoreIcon />
        </div>
      </button>
    </div>
  );
};

export default MarkmapSidebar;
