import * as React from "react";

import type { FileEntity } from "../type";

export type LinkItemProps = {
  sourcePath: string;
  fileEntity: FileEntity;
  onClick: (
    sourcePath: string,
    fileEntity: FileEntity,
    newLeaf: boolean,
  ) => void;
  getSumbnail: (fileEntity: FileEntity) => string;
};

const LinkBlock = (props: LinkItemProps) => {
  const sumbnail = props.getSumbnail(props.fileEntity);
  return (
    <div
      className={`twohop-links-box ${
        sumbnail ? "twohop-links-has-sumbnail" : ""
      }`}
      onClick={(event: React.MouseEvent) =>
        props.onClick(props.sourcePath, props.fileEntity, event.ctrlKey)
      }
    >
      {sumbnail && (
        <img
          className="twohop-links-box-preview"
          src={props.getSumbnail(props.fileEntity)}
          alt={"preview image"}
        />
      )}
      <div className="twohop-links-box-title">
        {props.fileEntity.displayText}
      </div>
    </div>
  );
};

export default LinkBlock;
