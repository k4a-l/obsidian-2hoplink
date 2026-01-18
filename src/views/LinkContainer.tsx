import * as React from "react";
import type { FileEntity } from "../type";
import LinkBlock from "./LinkBlock";
import LinkList from "./LinkList";

const VIEW_COUNT_BASE = 10;

const LinkContainer = ({
  type = "block",
  ...props
}: {
  sourcePath: string;
  fileEntities: FileEntity[];
  onClick: React.ComponentProps<typeof LinkBlock>["onClick"];
  onBlockTitleClick?: (e: React.MouseEvent) => void;
  title: string;
  className: string;
  getSumbnail: (fileEntity: FileEntity) => string;
  type?: "block" | "list";
}) => {
  const [count, setCount] = React.useState(
    Math.min(
      props.fileEntities.length,
      props.className.includes("back")
        ? props.fileEntities.length
        : VIEW_COUNT_BASE,
    ),
  );

  React.useEffect(() => {
    setCount(props.fileEntities.length);
  }, [props.fileEntities.length]);

  const Component = React.useMemo(
    () => (type === "block" ? LinkBlock : LinkList),
    [type],
  );

  if (props.fileEntities.length === 0) return <></>;

  return (
    <div
      className={`twohop-links-section ${props.className} twohop-type-${type}`}
    >
      <div
        className={"twohop-links-box-header"}
        onClick={props.onBlockTitleClick}
      >
        {props.title}
      </div>

      <div className={`twohop-links-block-container`}>
        {props.fileEntities.slice(0, count).map((it) => (
          <Component
            fileEntity={it}
            key={it.path}
            onClick={props.onClick}
            sourcePath={props.sourcePath}
            getSumbnail={props.getSumbnail}
          />
        ))}
        {count < props.fileEntities.length ? (
          <Component
            sourcePath={""}
            fileEntity={{
              path: "",
              displayText: "...",
              sumbnailPath: "",
            }}
            onClick={() => setCount(count + VIEW_COUNT_BASE)}
            getSumbnail={() => ""}
          />
        ) : null}
      </div>
    </div>
  );
};

export default LinkContainer;
