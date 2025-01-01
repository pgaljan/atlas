import React from "react";
import { MarkmapProvider } from "../markmap-context/MarkmapContext";
import MarkmapToolbar from "../markmap-toolbar/MarkmapToolbar";
import MarkmapEditor from "../markmap-editor/MarkmapEditor";
import { useParams } from "react-router-dom";

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
