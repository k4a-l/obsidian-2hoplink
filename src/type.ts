export type FileEntity = { path: string; name: string };

export type LinkEntity = FileEntity & { links: FileEntity[] };

export type TwoHopLink = FileEntity & {
  forward: LinkEntity[];
  back: LinkEntity[];
};

/** key: path */
export type LinksMap = Map<string, LinkEntity>;
