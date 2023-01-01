import * as React from "react";

import type { FileEntity } from "../type";

const LinkBlock = (props: {
  sourcePath: string;
  fileEntity: FileEntity;
  onClick: (
    sourcePath: string,
    fileEntity: FileEntity,
    newLeaf: boolean,
  ) => void;
}) => (
  <div
    className={"twohop-links-box"}
    onClick={(event: React.MouseEvent) =>
      props.onClick(props.sourcePath, props.fileEntity, event.ctrlKey)
    }
  >
    <div className="twohop-links-box-title">{props.fileEntity.displayText}</div>
  </div>
);

export default LinkBlock;
