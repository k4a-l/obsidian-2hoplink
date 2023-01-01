import * as React from "react";
import * as ReactDOM from "react-dom";
import { path2FileEntity } from "src/modules/utils";

import LinkContainer from "./LinkContainer";

import type { FileEntity, TagLinks, TwohopLink } from "../type";

export type Props = {
  sourcePath: string;
  forwardResolvedLinks: FileEntity[];
  newLinks: FileEntity[];
  backwardConnectedLinks: FileEntity[];
  twohopLinks: TwohopLink;
  tagLinksList: TagLinks[];
  onClick: React.ComponentProps<typeof LinkContainer>["onClick"];
};

export const ReactView = (props: Props) => (
    <>
      <LinkContainer
        sourcePath={props.sourcePath}
        fileEntities={props.forwardResolvedLinks}
        onClick={props.onClick}
        title={"Links"}
        className={"twohop-links-forward-links"}
      />
      <LinkContainer
        sourcePath={props.sourcePath}
        fileEntities={props.backwardConnectedLinks}
        onClick={props.onClick}
        title={"Backlinks"}
        className={"twohop-links-back-links"}
      />
      {props.twohopLinks.map(link => (
        <LinkContainer
          sourcePath={props.sourcePath}
          key={link.path}
          fileEntities={link.links.map(l => path2FileEntity(l))}
          onClick={props.onClick}
          title={link.displayText}
          className={"twohop-links-twohop-links"}
        />
      ))}

      {props.tagLinksList.map(it => (
        <LinkContainer
          sourcePath={props.sourcePath}
          key={it.tag}
          fileEntities={it.links.map(l => ({ path: l, displayText: l }))}
          onClick={props.onClick}
          title={it.tag}
          className={"twohop-links-tag-links"}
        />
      ))}
      <LinkContainer
        sourcePath={props.sourcePath}
        fileEntities={props.newLinks}
        onClick={props.onClick}
        title={"NewLinks"}
        className={"twohop-links-new-links"}
      />
    </>
  );

export const mountView = (element: Element, props: Props) => {
  //   const root = createRoot(element);
  //   root.render(
  //     <React.StrictMode>
  //       <ReactView {...props} />
  //     </React.StrictMode>,
  //   );

  ReactDOM.render(
    <React.StrictMode>
      <ReactView {...props} />
    </React.StrictMode>,
    element,
  );
};