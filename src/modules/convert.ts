import { path2Name } from "./utils";

import type { LinkEntity } from "src/type";

export const toOriginalFowardLinks = (
  links: Record<string, Record<string, number>>,
): LinkEntity[] =>
  Object.entries(links).map(([srcPath, dest]) => ({
    path: srcPath,
    displayText: path2Name(srcPath),
    links: Object.keys(dest).map(path => ({
      path,
      displayText: path2Name(path),
    })),
  }));

//   return fowardLinks;
