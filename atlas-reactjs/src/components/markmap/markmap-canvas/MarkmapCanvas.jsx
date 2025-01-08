import React from "react";
import { useParams } from "react-router-dom";
import { MarkmapProvider } from "../markmap-context/MarkmapContext";
import MarkmapEditor from "../markmap-editor/MarkmapEditor";
import MarkmapToolbar from "../markmap-toolbar/MarkmapToolbar";

const MarkmapCanvas = () => {
  const { structureName } = useParams();
  return (
    <MarkmapProvider>
      <div className="flex flex-col h-screen">
        <MarkmapToolbar />
        <MarkmapEditor initialContent={structureName} />
      </div>
    </MarkmapProvider>
  );
};

export default MarkmapCanvas;
