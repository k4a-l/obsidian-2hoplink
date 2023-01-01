import { path2FileEntity, path2Name, removeBlockReference } from "./utils";

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
        const currentBackInfo = backLinkMap.get(link.path);
        const { links, ...info } = file;
        backLinkMap.set(link.path, {
          ...link,
          links: [...(currentBackInfo ? currentBackInfo.links : []), info],
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
  target: "foward" | "back",
): TwohopLink => {
  const isNotBaseFile = (it: FileEntity) => it.path !== currentPath;

  const func = (files: FileEntity[]): LinkEntity[] =>
    files.reduce((prev, file): LinkEntity[] => {
      const f = getLinks(file.path, forwardLinkMap).filter(isNotBaseFile);
      const b = getLinks(file.path, backLinkMap).filter(isNotBaseFile);

      const files = [...new Set([...f, ...b].map(it => it.path))];

      if (files.length === 0) return prev;
      const current: LinkEntity = {
        ...path2FileEntity(file),
        links: files.map(it => ({ path: it, displayText: path2Name(it) })),
      };
      return [...prev, current];
    }, [] as LinkEntity[]);

  return func(
    getLinks(currentPath, target === "foward" ? forwardLinkMap : backLinkMap),
  );
};

export const getLinks = (currentFile: string, linkMap: LinksMap) =>
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
