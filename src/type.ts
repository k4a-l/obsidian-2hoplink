export type FileEntity = { path: string; displayText: string };

export type LinkEntity = FileEntity & { links: string[] };

export type TwohopLink = LinkEntity[];

/** key: path */
export type LinksMap = Map<string, LinkEntity>;

export type TagLinks = { tag: string; links: string[] };
