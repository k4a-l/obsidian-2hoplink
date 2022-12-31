import { makeBacklinksMap, makeTwoHopLinks } from "./make";

import type { FileEntity, LinksMap, TwoHopLink } from "../type";

type ValueInMapRecord = LinksMap extends Map<any, infer I> ? I : never;
type MapObject = { [key: string]: ValueInMapRecord };

const homeCooking: FileEntity = { path: "./homeCooking", name: "homeCooking" };
const diet: FileEntity = { path: "./diet", name: "diet" };
const favoriteFoot: FileEntity = {
  path: "./favoriteFoot",
  name: "favoriteFoot",
};
const highCalorie: FileEntity = { path: "./highCalorie", name: "highCalorie" };
const ramen: FileEntity = { path: "./Ramen", name: "Ramen" };
const sushi: FileEntity = { path: "./Sushi", name: "Sushi" };

const linkObject: MapObject = {
  [homeCooking.path]: { ...homeCooking, links: [ramen] },
  [favoriteFoot.path]: { ...favoriteFoot, links: [ramen, sushi] },
  [ramen.path]: { ...ramen, links: [highCalorie] },
  [sushi.path]: { ...sushi, links: [] },
  [highCalorie.path]: { ...highCalorie, links: [] },
  [diet.path]: { ...diet, links: [favoriteFoot, highCalorie] },
};
const fowardLinkMap: LinksMap = new Map(Object.entries(linkObject));

test("make backlink", () => {
  const backLinkObject: MapObject = {
    [homeCooking.path]: { ...homeCooking, links: [] },
    [favoriteFoot.path]: { ...favoriteFoot, links: [diet] },
    [ramen.path]: { ...ramen, links: [homeCooking, favoriteFoot] },
    [sushi.path]: { ...sushi, links: [favoriteFoot] },
    [highCalorie.path]: { ...highCalorie, links: [ramen, diet] },
    [diet.path]: { ...diet, links: [] },
  };
  const actual: LinksMap = new Map(Object.entries(backLinkObject));

  const recieved = makeBacklinksMap(fowardLinkMap);
  expect(recieved).toStrictEqual(actual);
});

test("make twohop", () => {
  const backlinkMap = makeBacklinksMap(fowardLinkMap);

  const currentFile = linkObject[favoriteFoot.path];

  const actual: TwoHopLink = {
    ...currentFile,
    forward: [{ ...linkObject[ramen.path], links: [highCalorie, homeCooking] }],
    back: [{ ...linkObject[diet.path], links: [highCalorie] }],
  };

  const recieved = makeTwoHopLinks(currentFile, fowardLinkMap, backlinkMap);

  expect(recieved).toStrictEqual(actual);
});

const printMap = (map: Map<any, any>) => printObject([...map]);

const printObject = (object: Object) =>
  console.log(JSON.stringify(object, null, 4));
