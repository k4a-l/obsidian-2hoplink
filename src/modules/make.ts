import { path2Name, removeBlockReference } from "./utils";

import type { FileEntity, LinkEntity, LinksMap, TwohopLink } from "../type";
import type { TFile, CachedMetadata } from "obsidian";

type LinkMaps = {
  resolvedLinks?: LinksMap;
  unresolvedLinks?: LinksMap;
};

export const makeBacklinksMap = ({
  resolvedLinks,
  unresolvedLinks,
}: LinkMaps): LinksMap => {
  const backLinkMap: LinksMap = new Map();

  const func = (map: LinksMap) => {
    map.forEach(file => {
      // Initialize(backlinkがない場合に作成されないため)
      const currentBackInfo = backLinkMap.get(file.path);
      backLinkMap.set(
        file.path,
        currentBackInfo ? currentBackInfo : { ...file, links: [] },
      );

      // link毎
      file.links.forEach(link => {
        const currentBackInfo = backLinkMap.get(link);
        backLinkMap.set(link, {
          path: link,
          displayText: path2Name(link),
          links: [...(currentBackInfo ? currentBackInfo.links : []), file.path],
        });
      });
    });
  };

  if (resolvedLinks) func(resolvedLinks);
  if (unresolvedLinks) func(unresolvedLinks);

  return backLinkMap;
};

export const makeTwoHopLinks = (
  currentPath: string,
  forwardLinkMap: LinksMap,
  backLinkMap: LinksMap,
  target: "forward" | "back",
): TwohopLink => {
  const isNotBaseFile = (it: string) => it !== currentPath;

  const func = (files: string[]): LinkEntity[] =>
    files.reduce((prev, file): LinkEntity[] => {
      const f = getLinks(file, forwardLinkMap).filter(isNotBaseFile);
      const b = getLinks(file, backLinkMap).filter(isNotBaseFile);

      const links = [...new Set([...f, ...b])];

      if (links.length === 0) return prev;
      const current: LinkEntity = {
        path: file,
        displayText: path2Name(file),
        links,
      };
      return [...prev, current];
    }, [] as LinkEntity[]);

  return func(
    getLinks(currentPath, target === "forward" ? forwardLinkMap : backLinkMap),
  );
};

export const getLinks = (currentFile: string, linkMap: LinksMap): string[] =>
  linkMap.get(currentFile)?.links ?? [];

export const getForwardLinks = (
  activeFile: TFile,
  activeFileCache: CachedMetadata,
): FileEntity[] => {
  if (activeFileCache === null) {
    // sometime, we can't get metadata cache from obsidian.
    console.log(`Missing activeFileCache '${activeFile.path}`);
    return [];
  }
  const seen = new Map<string, FileEntity>();

  if (activeFileCache.links) {
    activeFileCache.links.forEach(it => {
      const key = removeBlockReference(it.link);
      if (!seen.has(key)) {
        seen.set(key, { path: key, displayText: it.displayText ?? key });
      }
    });
  }

  if (activeFileCache.embeds) {
    activeFileCache.embeds.forEach(it => {
      const key = removeBlockReference(it.link);
      if (!seen.has(key)) {
        seen.set(key, { path: key, displayText: it.displayText ?? key });
      }
    });
  }

  return [...seen.values()];
};
