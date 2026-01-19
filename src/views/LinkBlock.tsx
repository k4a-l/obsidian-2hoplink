import { Link2Icon } from "lucide-react";
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
  icon?: React.ReactElement;
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
      {props.icon ? props.icon : <Link2Icon size={"1.2em"} />}
      {sumbnail && (
        <img
          className="twohop-links-box-preview"
          src={props.getSumbnail(props.fileEntity)}
          alt={"preview"}
        />
      )}
      <div className="twohop-links-box-title">
        {props.fileEntity.displayText}
      </div>
    </div>
  );
};

export default LinkBlock;
