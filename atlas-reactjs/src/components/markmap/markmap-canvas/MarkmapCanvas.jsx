import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MarkmapProvider } from "../markmap-context/MarkmapContext";
import MarkmapEditor from "../markmap-editor/MarkmapEditor";
import cogoToast from "@successtar/cogo-toast";
import MarkmapToolbar from "../markmap-toolbar/MarkmapToolbar";

const MarkmapCanvas = () => {
  const { structureId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!structureId) {
      cogoToast.error("Structure ID is missing");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  }, [structureId, navigate]);

  if (!structureId) {
    return null;
  }

  return (
    <MarkmapProvider>
      <div className="flex flex-col h-screen">
        <MarkmapToolbar />
        <MarkmapEditor structureId={structureId} />
      </div>
    </MarkmapProvider>
  );
};

export default MarkmapCanvas;
