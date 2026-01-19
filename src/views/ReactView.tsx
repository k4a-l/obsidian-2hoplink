import {
  ChevronUpIcon,
  FileInputIcon,
  FileOutputIcon,
  Link2Icon,
  X,
} from "lucide-react";
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

const LinksContent = (props: Props) => (
  <>
    <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.forwardResolvedLinks}
      onClick={props.onClick}
      icon={<FileInputIcon size={"1.2em"} />}
      className={"twohop-links-back-links"}
      getSumbnail={props.getSumbnail}
      type={`list`}
    />
    <LinkContainer
      sourcePath={props.sourcePath}
      fileEntities={props.backwardConnectedLinks}
      onClick={props.onClick}
      icon={<FileOutputIcon size={"1.2em"} />}
      className={"twohop-links-back-links"}
      getSumbnail={props.getSumbnail}
      type={`list`}
    />
    {props.newLinks.length +
      props.tagLinksList.length +
      props.twohopLinks.length >
      0 && (
      <div className="twohop-links-section-container">
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
      </div>
    )}
  </>
);

import { useFloatingDrawer } from "./useFloatingDrawer";

export const ReactView = (props: Props) => {
  const hasLinks =
    props.forwardResolvedLinks.length +
      props.backwardConnectedLinks.length +
      props.newLinks.length >
    0;

  const {
    isFloating,
    showButton,
    isNoAnimation,
    placeholderRef,
    contentRef,
    placeholderHeight,
    openFloating,
    closeFloating,
  } = useFloatingDrawer(hasLinks);

  return (
    <>
      <div
        ref={placeholderRef}
        style={{
          height: isFloating ? placeholderHeight : "auto",
          minHeight: "1px", // Ensure observer can fire
        }}
      >
        <div
          ref={contentRef}
          className={`twohop-links-container-wrapper ${
            isFloating ? "floating-mode" : ""
          } ${isFloating && isNoAnimation ? "no-animation" : ""}`}
        >
          {isFloating && (
            <div className="twohop-links-drawer-close" onClick={closeFloating}>
              <X size="1.5em" />
            </div>
          )}
          <div className="twohop-links-content-scrollable">
            <LinksContent {...props} />
          </div>
        </div>
      </div>

      {hasLinks && (
        <div
          className={`twohop-links-floating-button ${
            !showButton || isFloating ? "hidden" : ""
          }`}
          onClick={openFloating}
        >
          {props.forwardResolvedLinks.length ? (
            <div className="twohop-links-floating-button-item">
              <FileInputIcon size="1.2em" /> {props.forwardResolvedLinks.length}
            </div>
          ) : null}
          {props.backwardConnectedLinks.length ? (
            <div className="twohop-links-floating-button-item">
              <FileOutputIcon size="1.2em" />{" "}
              {props.backwardConnectedLinks.length}
            </div>
          ) : null}
          {props.newLinks.length ? (
            <div className="twohop-links-floating-button-item">
              <Link2Icon size="1.2em" /> {props.newLinks.length}
            </div>
          ) : null}
          <ChevronUpIcon size="1.2em" />
        </div>
      )}
    </>
  );
};

// TODO:  You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it.
// 問題の解消

const roots = new WeakMap<Element, Root>();

export const mountView = (element: Element, props: Props) => {
  let root = roots.get(element);

  // Obsidianなど外部によってコンテナの中身がクリアされた場合、
  // Reactの内部状態とDOMが不整合を起こすため、古いrootを破棄して作り直す
  // childNodes.length === 0 で完全に空かどうかをチェックする
  if (root && element.childNodes.length === 0) {
    try {
      root.unmount();
    } catch (e) {
      console.warn("[2hoplink] Check unmount error", e);
    }
    roots.delete(element);
    root = undefined;
  }

  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }

  root.render(<ReactView {...props} />);
};

export const unmountView = (element: Element) => {
  const root = roots.get(element);
  if (root) {
    root.unmount();
    roots.delete(element);
  }
};
