import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Markmap } from "markmap-view";

const MarkmapContext = createContext();

export const MarkmapProvider = ({ children }) => {
  const svgRef = useRef(null);
  const [markmapInstance, setMarkmapInstance] = useState(null);

  useEffect(() => {
    if (svgRef.current && !markmapInstance) {
      const instance = new Markmap(svgRef.current, {
        autoFit: true,
        nodeMinHeight: 20,
        duration: 300,
      });
      setMarkmapInstance(instance);
    }
  }, [svgRef, markmapInstance]);

  return (
    <MarkmapContext.Provider value={{ markmapInstance, svgRef }}>
      <div className="h-full w-full">{children}</div>
    </MarkmapContext.Provider>
  );
};

export const useMarkmap = () => {
  const context = useContext(MarkmapContext);
  if (!context) {
    throw new Error("useMarkmap must be used within a MarkmapProvider");
  }
  return context;
};
