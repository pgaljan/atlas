import React from 'react';
import useMarkmap from '../../markmap/markmap-context/MarkmapContext';
import useMarkmapInteractions from '../../markmap/markmap-editor/MarkmapEditor';

const CleanSheetMarkmap = ({ treeData, setTreeData, structureId, ...rest }) => {
  const { markmapInstance, svgRef } = useMarkmap();

  useMarkmapInteractions({
    ...rest,
    markmapInstance,
    svgRef,
  });

  return (
    <div className="w-full h-full border border-gray-300 rounded-md bg-white relative">
      <svg ref={svgRef} className="w-full h-full dotted-bg" />
    </div>
  );
};

export default CleanSheetMarkmap;
