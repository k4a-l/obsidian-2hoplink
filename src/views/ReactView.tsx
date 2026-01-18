import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { FileEntity, TagLinks, TwohopLink } from "../type";
import LinkContainer from "./LinkContainer";

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
    {/* <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.forwardResolvedLinks}
      onClick={props.onClick}
      title={"Links"}
      className={"twohop-links-forward-links"}
      getSumbnail={props.getSumbnail}
    /> */}
    <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.backwardConnectedLinks}
      onClick={props.onClick}
      title={"Backlinks"}
      className={"twohop-links-back-links"}
      getSumbnail={props.getSumbnail}
      type={`list`}
    />
    {props.twohopLinks.map((link) => (
      <LinkContainer
        sourcePath={props.sourcePath}
        key={link.path}
        fileEntities={link.links}
        onClick={props.onClick}
        onBlockTitleClick={(e: React.MouseEvent) =>
          props.onClick(props.sourcePath, link, e.ctrlKey)
        }
        title={link.displayText}
        className={"twohop-links-twohop-links"}
        getSumbnail={props.getSumbnail}
      />
    ))}

    {props.tagLinksList.map((it) => (
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

// TODO:  You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it.
// 問題の解消

const roots = new WeakMap<Element, Root>();

export const mountView = (element: Element, props: Props) => {
  let root = roots.get(element);

  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }

  root.render(
    <React.StrictMode>
      <ReactView {...props} />
    </React.StrictMode>,
  );
};

export const unmountView = (element: Element) => {
  const root = roots.get(element);
  if (root) {
    root.unmount();
    roots.delete(element);
  }
};
