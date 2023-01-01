import { makeBacklinksMap, makeTwoHopLinks } from "./make";

import type { FileEntity, LinksMap, TwohopLink } from "../type";

type ValueInMapRecord = LinksMap extends Map<any, infer I> ? I : never;
type MapObject = { [key: string]: ValueInMapRecord };

const homeCooking: FileEntity = { path: "./homeCooking.md", displayText: "" };
const diet: FileEntity = { path: "./diet.md", displayText: "" };
const favoriteFoot: FileEntity = {
  path: "./favoriteFoot.md",
  displayText: "",
};
const highCalorie: FileEntity = { path: "./highCalorie.md", displayText: "" };
const ramen: FileEntity = { path: "./Ramen.md", displayText: "" };
const sushi: FileEntity = { path: "./Sushi.md", displayText: "" };

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

  const recieved = makeBacklinksMap({ resolvedLinks: fowardLinkMap });
  expect(recieved).toStrictEqual(actual);
});

test("make twohop", () => {
  const backlinkMap = makeBacklinksMap({ resolvedLinks: fowardLinkMap });

  const currentFile = linkObject[favoriteFoot.path];

  const foward: TwohopLink = [
    {
      ...{ path: ramen.path, displayText: "Ramen" },
      links: [
        { path: highCalorie.path, displayText: "highCalorie" },
        { path: homeCooking.path, displayText: "homeCooking" },
      ],
    },
  ];

  const back: TwohopLink = [
    {
      ...{ path: diet.path, displayText: "diet" },
      links: [{ path: highCalorie.path, displayText: "highCalorie" }],
    },
  ];

  expect(
    makeTwoHopLinks(currentFile.path, fowardLinkMap, backlinkMap, "foward"),
  ).toStrictEqual(foward);

  expect(
    makeTwoHopLinks(currentFile.path, fowardLinkMap, backlinkMap, "back"),
  ).toStrictEqual(back);
});

const printMap = (map: Map<any, any>) => printObject([...map]);

const printObject = (object: Object) =>
  console.log(JSON.stringify(object, null, 4));
