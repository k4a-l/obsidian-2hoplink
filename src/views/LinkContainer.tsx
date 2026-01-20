import { FileIcon } from "lucide-react";
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
  title?: string;
  icon?: React.ReactElement;
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
  const countRef = React.useRef(count);

  React.useEffect(() => {
    if (countRef.current < props.fileEntities.length) {
      setCount(Math.min(props.fileEntities.length, VIEW_COUNT_BASE));
    }
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
        {<FileIcon size={"1.2em"} />}
        {props.title ? props.title : ""}
      </div>

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
            // sourcePath={""}
            // fileEntity={{
            //   path: "",
            //   displayText: "  ...  ",
            //   sumbnailPath: "",
            // }}
            className="twohop-links-box twohop-links-box-more"
            onClick={() => setCount(props.fileEntities.length)}
            // getSumbnail={() => ""}
          >
            ... {props.fileEntities.length}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LinkContainer;
