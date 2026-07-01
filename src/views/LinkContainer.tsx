import { ChevronDownIcon, FileIcon } from "lucide-react";
import * as React from "react";
import type { FileEntity } from "../type";
import LinkBlock from "./LinkBlock";
import LinkList from "./LinkList";

const VIEW_COUNT_BASE = 10;

const LinkContainer = ({
  type = "block",
  canFold = false,
  defaultFolded = false,
  ...props
}: {
  sourcePath: string;
  fileEntities: FileEntity[];
  onClick: React.ComponentProps<typeof LinkBlock>["onClick"];
  onBlockTitleClick?: (e: React.MouseEvent) => void;
  title?: string;
  icon?: React.ReactElement;
  className: string;
  getSumbnail: (fileEntity: FileEntity) => string;
  type?: "block" | "list";
  canFold?: boolean;
  defaultFolded?: boolean;
}) => {
  const [_count, setCount] = React.useState(
    Math.min(
      props.fileEntities.length,
      props.className.includes("back")
        ? props.fileEntities.length
        : VIEW_COUNT_BASE,
    ),
  );
  const countRef = React.useRef(_count);

  const count = React.useMemo(() => {
    return defaultFolded ? props.fileEntities.length : _count;
  }, [defaultFolded, props.fileEntities.length, _count]);
  const [folded, setFolded] = React.useState(defaultFolded);

  React.useEffect(() => {
    if (countRef.current < props.fileEntities.length) {
      setCount(Math.min(props.fileEntities.length, VIEW_COUNT_BASE));
    }
  }, [props.fileEntities.length]);

  const Component = React.useMemo(
    () => (type === "block" ? LinkBlock : LinkList),
    [type],
  );

  if (props.fileEntities.length === 0) return null;

  const isHeaderShown = props.title || canFold;

  return (
    <div
      className={`twohop-links-section ${props.className} twohop-type-${type}`}
    >
      {isHeaderShown && (
        <div
          className={"twohop-links-box-header"}
          onClick={props.onBlockTitleClick}
        >
          {props.title ? (
            <>
              <FileIcon size={"1.2em"} />
              {props.title}
            </>
          ) : (
            ""
          )}
          {canFold && (
            <div
              className="twohop-links-box-header-fold"
              onClick={() => setFolded(!folded)}
            >
              <ChevronDownIcon
                size={"1.2em"}
                style={{
                  rotate: folded ? "0deg" : "180deg",
                  transition: "rotate 0.2s",
                  cursor: "pointer",
                }}
              />
            </div>
          )}
        </div>
      )}
      {!folded && (
        <div className={`twohop-links-block-container`}>
          {props.fileEntities.slice(0, count).map((it) => (
            <Component
              fileEntity={it}
              key={it.path}
              onClick={props.onClick}
              sourcePath={props.sourcePath}
              getSumbnail={props.getSumbnail}
              icon={props.icon}
            />
          ))}
          {count < props.fileEntities.length ? (
            <div
              className="twohop-links-box twohop-links-box-more"
              onClick={() => setCount(props.fileEntities.length)}
            >
              ... {props.fileEntities.length}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LinkContainer;
