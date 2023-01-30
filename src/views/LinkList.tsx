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
      <div className="twohop-links-box-container">
        {/* {sumbnail && (
          <img
            className="twohop-links-box-preview"
            src={props.getSumbnail(props.fileEntity)}
            alt={"preview image"}
          />
        )} */}
        <div className="twohop-links-box-title">
          {props.fileEntity.displayText}
        </div>
      </div>
    </div>
  );
};

export default LinkList;
