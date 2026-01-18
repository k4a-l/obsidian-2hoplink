import type { CachedMetadata } from "obsidian";
import type { LinkEntity } from "src/type";
import { path2Name } from "./utils";

export const toOriginalFowardLinks = (
  links: Record<string, Record<string, number>>,
  getCache: (path: string) => CachedMetadata | null,
): LinkEntity[] =>
  Object.entries(links).map(([srcPath, dest]) => {
    const fileCache = getCache(srcPath);
    return {
      path: srcPath,
      displayText: path2Name(srcPath),
      links: Object.keys(dest).map((path) => ({
        path,
        displayText: path2Name(path),
        sumbnailPath: links[path]
          ? (Object.keys(links[path]).find((path) =>
              path.match(/(?<temp1>.jpg|.png|.bmp|.webp|.avif)$/u),
            ) ?? "")
          : "",
      })),
      sumbnailPath:
        fileCache?.embeds
          ?.map((l) => l.link)
          .find((path) =>
            path.match(/(?<temp1>.jpg|.png|.bmp|.webp|.avif)$/u),
          ) ?? "",
    };
  });
