import { removeBlockReference } from "./utils";

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
        if (link.path === file.path) return;

        const { links: _, ...fileEntity } = file;

        backLinkMap.set(link.path, {
          ...link,
          links: [
            ...(currentBackInfo ? currentBackInfo.links : []),
            fileEntity,
          ],
        });
      });
    });
  };

  if (resolvedLinks) func(resolvedLinks);
  if (unresolvedLinks) func(unresolvedLinks);

  return backLinkMap;
};

export const makeTwoHopLinks = (
  currentFilePath: string,
  forwardLinkMap: LinksMap,
  backLinkMap: LinksMap,
  target: "forward" | "back",
): TwohopLink => {
  const isNotBaseFile = (it: FileEntity) => it.path !== currentFilePath;

  const func = (files: FileEntity[]): LinkEntity[] =>
    files.reduce((prev, file): LinkEntity[] => {
      if (file.path === currentFilePath) return prev;

      const f = getLinks(file, forwardLinkMap).filter(isNotBaseFile);
      const b = getLinks(file, backLinkMap).filter(isNotBaseFile);

      const linksPath = [
        ...new Set(
          [...f.map(it => it.path), ...b.map(it => it.path)].filter(
            it => it !== file.path,
          ),
        ),
      ];
      const links = [...f, ...b];

      if (links.length === 0) return prev;

      const current: LinkEntity = {
        ...file,
        links: linksPath.flatMap(
          path => links.find(link => link.path === path) ?? [],
        ),
      };
      return [...prev, current];
    }, [] as LinkEntity[]);

  return func(
    getLinks(
      { path: currentFilePath },
      target === "forward" ? forwardLinkMap : backLinkMap,
    ),
  );
};

export const getLinks = (file: { path: string }, linkMap: LinksMap) =>
  linkMap.get(file.path)?.links ?? [];

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
      if (!seen.has(key) && it.link !== activeFile.basename) {
        seen.set(key, {
          path: key,
          displayText: it.displayText ?? key,
          sumbnailPath: "",
        });
      }
    });
  }

  if (activeFileCache.embeds) {
    activeFileCache.embeds.forEach(it => {
      const key = removeBlockReference(it.link);
      if (!seen.has(key) && it.link !== activeFile.basename) {
        seen.set(key, {
          path: key,
          displayText: it.displayText ?? key,
          sumbnailPath: "",
        });
      }
    });
  }

  return [...seen.values()];
};
