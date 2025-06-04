import { useSearchParams } from "react-router-dom";
import MarkmapCanvas from "../markmap/markmap-canvas/MarkmapCanvas";
import Syncfusion from "../../containers/user-portal/sync-fusion";

const StructureRenderer = () => {
  const [searchParams] = useSearchParams();
  const renderer = searchParams.get("renderer") || "markmap";

  if (renderer === "syncfusion") {
    return <Syncfusion />;
  }

  if (renderer === "markmap") {
    return <MarkmapCanvas />;
  }
};

export default StructureRenderer;
