export type FileEntity = {
  path: string;
  displayText: string;
  sumbnailPath: string;
};

export type LinkEntity = FileEntity & { links: FileEntity[] };

export type TwohopLink = LinkEntity[];

/** key: path */
export type LinksMap = Map<string, LinkEntity>;

export type TagLinks = { tag: string; links: string[] };
