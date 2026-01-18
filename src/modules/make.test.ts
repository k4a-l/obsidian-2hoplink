import { describe, expect, test } from "vitest";
import type { FileEntity, LinksMap, TwohopLink } from "../type";
import { makeBacklinksMap, makeTwoHopLinks } from "./make";

type ValueInMapRecord = LinksMap extends Map<string, infer I> ? I : never;
type MapObject = { [key: string]: ValueInMapRecord };

const homeCooking: FileEntity = {
  path: "./homeCooking.md",
  displayText: "homeCooking",
  sumbnailPath: "",
};
const diet: FileEntity = {
  path: "./diet.md",
  displayText: "diet",
  sumbnailPath: "",
};
const favoriteFoot: FileEntity = {
  path: "./favoriteFoot.md",
  displayText: "favoriteFoot",
  sumbnailPath: "",
};
const highCalorie: FileEntity = {
  path: "./highCalorie.md",
  displayText: "highCalorie",
  sumbnailPath: "",
};
const ramen: FileEntity = {
  path: "./Ramen.md",
  displayText: "Ramen",
  sumbnailPath: "",
};
const sushi: FileEntity = {
  path: "./Sushi.md",
  displayText: "Sushi",
  sumbnailPath: "",
};

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

describe("make twohop", () => {
  const backlinkMap = makeBacklinksMap({ resolvedLinks: fowardLinkMap });

  const currentFile = linkObject[favoriteFoot.path];

  const foward: TwohopLink = [
    {
      path: ramen.path,
      displayText: "Ramen",
      sumbnailPath: "",
      links: [highCalorie, homeCooking],
    },
  ];

  const back: TwohopLink = [
    {
      path: diet.path,
      displayText: "diet",
      sumbnailPath: "",
      links: [highCalorie],
    },
  ];

  console.log(backlinkMap.get(favoriteFoot.path));

  test("forward", () => {
    expect(
      makeTwoHopLinks(currentFile.path, fowardLinkMap, backlinkMap, "forward"),
    ).toStrictEqual(foward);
  });

  test("back", () => {
    expect(
      makeTwoHopLinks(currentFile.path, fowardLinkMap, backlinkMap, "back"),
    ).toStrictEqual(back);
  });
});

// const printMap = (map: Map<any, any>) => printObject([...map]);

const printObject = (object: unknown) =>
  console.log(JSON.stringify(object, null, 4));
