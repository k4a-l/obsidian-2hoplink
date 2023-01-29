import * as React from "react";

import LinkBlock from "./LinkBlock";

import type { FileEntity } from "../type";

const LinkContainer = (props: {
  sourcePath: string;
  fileEntities: FileEntity[];
  onClick: React.ComponentProps<typeof LinkBlock>["onClick"];
  onBlockTitleClick?: (e: React.MouseEvent) => void;
  title: string;
  className: string;
  getSumbnail: (fileEntity: FileEntity) => string;
}) => {
  if (props.fileEntities.length === 0) return <></>;
  return (
    <div className={`twohop-links-section ${props.className}`}>
      <div
        className={"twohop-links-box twohop-links-box-header"}
        onClick={props.onBlockTitleClick}
      >
        {props.title}
      </div>

      {props.fileEntities.map(it => (
        <LinkBlock
          fileEntity={it}
          key={it.path}
          onClick={props.onClick}
          sourcePath={props.sourcePath}
          getSumbnail={props.getSumbnail}
        />
      ))}
    </div>
  );
};

export default LinkContainer;
