import * as React from "react";
import * as ReactDOM from "react-dom";

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
  getSumbnail: (fileEntity: FileEntity) => string;
};

export const ReactView = (props: Props) => (
  <>
    <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.forwardResolvedLinks}
      onClick={props.onClick}
      title={"Links"}
      className={"twohop-links-forward-links"}
      getSumbnail={props.getSumbnail}
    />
    <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.backwardConnectedLinks}
      onClick={props.onClick}
      title={"Backlinks"}
      className={"twohop-links-back-links"}
      getSumbnail={props.getSumbnail}
    />
    {props.twohopLinks.map(link => (
      <LinkContainer
        sourcePath={props.sourcePath}
        key={link.path}
        fileEntities={link.links}
        onClick={props.onClick}
        title={link.displayText}
        className={"twohop-links-twohop-links"}
        getSumbnail={props.getSumbnail}
      />
    ))}

    {props.tagLinksList.map(it => (
      <LinkContainer
        sourcePath={props.sourcePath}
        key={it.tag}
        fileEntities={it.links}
        onClick={props.onClick}
        title={it.tag}
        className={"twohop-links-tag-links"}
        getSumbnail={props.getSumbnail}
      />
    ))}
    <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.newLinks}
      onClick={props.onClick}
      title={"NewLinks"}
      className={"twohop-links-new-links"}
      getSumbnail={props.getSumbnail}
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
