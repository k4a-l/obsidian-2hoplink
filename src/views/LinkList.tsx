import { LogOutIcon } from "lucide-react";
import * as React from "react";
import type { LinkItemProps } from "./LinkBlock";

const LinkList = (props: LinkItemProps) => {
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
      {props.icon ? props.icon : <LogOutIcon size={"1.2em"} />}
      <div className="twohop-links-box-title">
        {props.fileEntity.displayText}
      </div>
    </div>
  );
};

export default LinkList;
