import type { FileEntity } from "src/type";

export const removeBlockReference = (src: string): string =>
  src.replace(/#.*$/u, "");

export const path2Name = (path: string): string =>
  path.replace(/\.md$/u, "").replace(/.*\//u, "");

export const path2FileEntity = (src: FileEntity): FileEntity => ({
  path: src.path,
  displayText: path2Name(src.path),
});
