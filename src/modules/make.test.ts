import { makeBacklinksMap, makeTwoHopLinks } from "./make";

import type { FileEntity, LinksMap, TwohopLink } from "../type";

type ValueInMapRecord = LinksMap extends Map<any, infer I> ? I : never;
type MapObject = { [key: string]: ValueInMapRecord };

const homeCooking: FileEntity = {
  path: "./homeCooking.md",
  displayText: "homeCooking",
};
const diet: FileEntity = { path: "./diet.md", displayText: "diet" };
const favoriteFoot: FileEntity = {
  path: "./favoriteFoot.md",
  displayText: "favoriteFoot",
};
const highCalorie: FileEntity = {
  path: "./highCalorie.md",
  displayText: "highCalorie",
};
const ramen: FileEntity = { path: "./Ramen.md", displayText: "Ramen" };
const sushi: FileEntity = { path: "./Sushi.md", displayText: "Sushi" };

const linkObject: MapObject = {
  [homeCooking.path]: { ...homeCooking, links: [ramen.path] },
  [favoriteFoot.path]: { ...favoriteFoot, links: [ramen.path, sushi.path] },
  [ramen.path]: { ...ramen, links: [highCalorie.path] },
  [sushi.path]: { ...sushi, links: [] },
  [highCalorie.path]: { ...highCalorie, links: [] },
  [diet.path]: { ...diet, links: [favoriteFoot.path, highCalorie.path] },
};
const fowardLinkMap: LinksMap = new Map(Object.entries(linkObject));

test("make backlink", () => {
  const backLinkObject: MapObject = {
    [homeCooking.path]: { ...homeCooking, links: [] },
    [favoriteFoot.path]: { ...favoriteFoot, links: [diet.path] },
    [ramen.path]: { ...ramen, links: [homeCooking.path, favoriteFoot.path] },
    [sushi.path]: { ...sushi, links: [favoriteFoot.path] },
    [highCalorie.path]: { ...highCalorie, links: [ramen.path, diet.path] },
    [diet.path]: { ...diet, links: [] },
  };
  const actual: LinksMap = new Map(Object.entries(backLinkObject));

  const recieved = makeBacklinksMap({ resolvedLinks: fowardLinkMap });
  expect(recieved).toStrictEqual(actual);
});

test("make twohop", () => {
  const backlinkMap = makeBacklinksMap({ resolvedLinks: fowardLinkMap });

  const currentFile = linkObject[favoriteFoot.path];

  const foward: TwohopLink = [
    {
      ...{ path: ramen.path, displayText: "Ramen" },
      links: [highCalorie.path, homeCooking.path],
    },
  ];

  const back: TwohopLink = [
    {
      ...{ path: diet.path, displayText: "diet" },
      links: [highCalorie.path],
    },
  ];

  expect(
    makeTwoHopLinks(currentFile.path, fowardLinkMap, backlinkMap, "forward"),
  ).toStrictEqual(foward);

  expect(
    makeTwoHopLinks(currentFile.path, fowardLinkMap, backlinkMap, "back"),
  ).toStrictEqual(back);
});

const printMap = (map: Map<any, any>) => printObject([...map]);

const printObject = (object: Object) =>
  console.log(JSON.stringify(object, null, 4));
