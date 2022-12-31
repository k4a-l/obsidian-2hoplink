import type { FileEntity, LinkEntity, LinksMap, TwoHopLink } from "../type";

export const makeBacklinksMap = (forwardLinkMap: LinksMap): LinksMap => {
  const backLinkMap: LinksMap = new Map();

  forwardLinkMap.forEach(file => {
    // Initialize(backlinkがない場合に作成されないため)
    const currentBackInfo = backLinkMap.get(file.path);
    backLinkMap.set(
      file.path,
      currentBackInfo ? currentBackInfo : { ...file, links: [] },
    );

    // link毎
    file.links.forEach(link => {
      const currentBackInfo = backLinkMap.get(link.path);
      const { links: other, ...info } = file;
      backLinkMap.set(link.path, {
        ...link,
        links: [...(currentBackInfo ? currentBackInfo.links : []), info],
      });
    });
  });

  return backLinkMap;
};

export const makeTwoHopLinks = (
  currentFile: FileEntity,
  forwardLinkMap: LinksMap,
  backLinkMap: LinksMap,
): TwoHopLink => {
  const isNotBaseFile = (it: FileEntity) => it.path !== currentFile.path;

  const func = (files: FileEntity[]) =>
    files.reduce((prev, file) => {
      const f = getLinks(file, forwardLinkMap).filter(isNotBaseFile);
      const b = getLinks(file, backLinkMap).filter(isNotBaseFile);
      const links = [...f, ...b];
      if (links.length === 0) return prev;
      const current: LinkEntity = { ...file, links };
      return [...prev, current];
    }, []);

  const fowardTwoHopLink: TwoHopLink["forward"] = func(
    getLinks(currentFile, forwardLinkMap),
  );
  const backTwoHopLink: TwoHopLink["back"] = func(
    getLinks(currentFile, backLinkMap),
  );

  return { ...currentFile, back: backTwoHopLink, forward: fowardTwoHopLink };
};

const getLinks = (currentFile: FileEntity, linkMap: LinksMap) =>
  linkMap.get(currentFile.path)?.links ?? [];
