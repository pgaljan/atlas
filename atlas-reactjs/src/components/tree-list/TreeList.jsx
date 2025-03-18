import React from "react";
import { FixedSizeList as List } from "react-window";

const TreeList = ({ data }) => (
  <List
    height={500}
    itemCount={data.children.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>{data.children[index].content}</div>
    )}
  </List>
);

export default TreeList;
