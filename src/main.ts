import { MarkdownView, Plugin } from "obsidian";

import { toOriginalFowardLinks } from "./modules/convert";
import { getTargetElement } from "./modules/htmlElement";
import {
  getForwardLinks,
  getLinks,
  makeBacklinksMap,
  makeTwoHopLinks,
} from "./modules/make";
import { path2Name, removeBlockReference } from "./modules/utils";
import { SampleSettingTab } from "./setting";
import { mountView } from "./views/ReactView";

import type { TwohopLinkSettings } from "./setting";
import type { FileEntity, LinkEntity, LinksMap, TagLinks } from "./type";
import type { Props } from "./views/ReactView";
import type { CachedMetadata, EventRef, TFile } from "obsidian";

const DEFAULT_SETTINGS: TwohopLinkSettings = {
  excludesDuplicateLinks: true,
  excludeTag: false,
  effectiveExtension: [],
};

export default class TwohopLink extends Plugin {
  settings: TwohopLinkSettings;

  private eventRefs: EventRef[];

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.eventRefs = [
      this.app.workspace.on("file-open", () => {
        this.render();
      }),
      this.app.metadataCache.on("resolve", file => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile !== null) {
          if (file.path === activeFile.path) {
            this.render();
          }
        }
      }),
    ];

    this.render();
  }

  onunload() {
    this.eventRefs.forEach(ref => this.app.metadataCache.offref(ref));
    this.removeView();
  }

  private render() {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView === null) return;

    const activeFile = markdownView.file;
    if (activeFile === null) return;

    const activeFileCache = this.app.metadataCache.getFileCache(activeFile);
    if (!activeFileCache) return;

    const linkedPathSet = new Set<string>();
    const getLinkedPathSet = () =>
      this.settings.excludesDuplicateLinks
        ? {
            has: linkedPathSet.has.bind(linkedPathSet),
            add: linkedPathSet.add.bind(linkedPathSet),
          }
        : { has: (v: string) => false, add: (v: string) => linkedPathSet };
    const isFirst = (path: string) => {
      if (!getLinkedPathSet().has(path)) {
        getLinkedPathSet().add(path);
        return true;
      }
      return false;
    };

    const resolvedFowardLinks = this.makeLinkMap(
      toOriginalFowardLinks(this.app.metadataCache.resolvedLinks),
    );
    const unresolvedFowardLinks = this.makeLinkMap(
      toOriginalFowardLinks(this.app.metadataCache.unresolvedLinks),
    );

    console.log(this.app.metadataCache.resolvedLinks);

    const backLinks = makeBacklinksMap({
      resolvedLinks: resolvedFowardLinks,
      unresolvedLinks: unresolvedFowardLinks,
    });

    const fowardLinks = getForwardLinks(activeFile, activeFileCache).filter(
      it => isFirst(it.path),
    );

    const [forwardResolvedLinks, newLinks] = this.splitByResolve(
      activeFile,
      fowardLinks,
      {
        resolvedLinks: resolvedFowardLinks,
        unresolvedLinks: unresolvedFowardLinks,
      },
    );

    const backwardConnectedLinks: FileEntity[] = getLinks(
      activeFile,
      backLinks,
    ).filter(it => isFirst(it.path));

    const resolvedTwoHopLinks = makeTwoHopLinks(
      activeFile.path,
      resolvedFowardLinks,
      backLinks,
      "forward",
    );

    const unresolvedTwoHopLinks = makeTwoHopLinks(
      activeFile.path,
      unresolvedFowardLinks,
      backLinks,
      "forward",
    );

    const backTwoHopLinks = makeTwoHopLinks(
      activeFile.path,
      resolvedFowardLinks,
      backLinks,
      "back",
    );

    const twohopMap = new Map<string, LinkEntity>();
    [
      ...resolvedTwoHopLinks,
      ...unresolvedTwoHopLinks,
      ...backTwoHopLinks,
    ].forEach(link => {
      if (twohopMap.has(link.path)) return;
      twohopMap.set(link.path, {
        ...link,
        links: link.links.filter(it => isFirst(it.path)),
      });
    });

    const tagLinksList = this.getTagLinksList(
      activeFile,
      activeFileCache,
      resolvedFowardLinks,
    );

    this.injectView({
      sourcePath: activeFile.path,
      forwardResolvedLinks,
      backwardConnectedLinks,
      twohopLinks: [...twohopMap.values()],
      tagLinksList,
      newLinks,
      onClick: this.openFile.bind(this),
      getSumbnail: this.getSumbnail.bind(this),
    });
  }

  private splitByResolve(
    activeFile: TFile,
    fowardLinks: FileEntity[],
    linkMap: {
      resolvedLinks: LinksMap;
      unresolvedLinks: LinksMap;
    },
  ) {
    const forwardResolvedLinks = fowardLinks.flatMap(l => {
      const links = getLinks(activeFile, linkMap.resolvedLinks);
      const file = this.app.metadataCache.getFirstLinkpathDest(
        l.displayText,
        activeFile.path,
      );
      const link = links.find(it => it.path === file?.path);
      return link ?? [];
    });

    const newLinks = fowardLinks.filter(l => {
      const links = getLinks(activeFile, linkMap.unresolvedLinks);
      return links.find(it => it.path === l.path);
    });

    return [forwardResolvedLinks, newLinks];
  }

  private getSumbnail(fileEntity: FileEntity) {
    if (fileEntity.sumbnailPath === "") return "";
    return this.app.vault.adapter.getResourcePath(fileEntity.sumbnailPath);
  }

  private openFile(
    sourcePath: string,
    fileEntity: FileEntity,
    newLeaf: boolean,
  ) {
    const linkText = removeBlockReference(fileEntity.path);

    console.debug(
      `Open file: linkText='${linkText}', sourcePath='${fileEntity.path}'`,
    );

    const file = this.app.metadataCache.getFirstLinkpathDest(
      linkText,
      sourcePath,
    );

    if (!file) {
      // eslint-disable-next-line no-alert
      if (!confirm(`Create new file: ${linkText}?`)) {
        console.log("Canceled!!");
      }

      return;
    }

    this.app.workspace.openLinkText(linkText, sourcePath, newLeaf);
  }

  getTagLinksList(
    activeFile: TFile,
    activeFileCache: CachedMetadata,
    forwardLinkMap: LinksMap,
  ): TagLinks[] {
    if (!activeFileCache.tags) return [];

    const activeFileTagSet = new Set(activeFileCache.tags.map(it => it.tag));
    const tagMap: Record<string, FileEntity[]> = {};
    for (const markdownFile of this.app.vault.getMarkdownFiles()) {
      if (markdownFile === activeFile) continue;

      const cachedMetadata = this.app.metadataCache.getFileCache(markdownFile);
      if (!cachedMetadata?.tags) continue;

      for (const tag of cachedMetadata.tags.filter(it =>
        activeFileTagSet.has(it.tag),
      )) {
        if (!tagMap[tag.tag]) {
          tagMap[tag.tag] = [];
        }

        tagMap[tag.tag].push(
          forwardLinkMap.get(markdownFile.path) ?? {
            path: markdownFile.path,
            displayText: path2Name(markdownFile.path),
            sumbnailPath: "",
          },
        );
      }
    }

    const tagLinksList: TagLinks[] = [];
    for (const tagMapKey of Object.keys(tagMap)) {
      tagLinksList.push({ tag: tagMapKey, links: tagMap[tagMapKey] });
    }
    console.log(tagLinksList);
    return tagLinksList;
  }

  makeLinkMap(links: LinkEntity[]) {
    const omitIneffectiveExtention = (it: LinkEntity): LinkEntity => {
      const f = it.links.flatMap(f => {
        const file = this.app.metadataCache.getFirstLinkpathDest(
          f.displayText,
          it.path,
        );
        if (!file) return f;
        if (
          ["md", ...this.settings.effectiveExtension].contains(file.extension)
        )
          return f;
        return [];
      });
      return { ...it, links: f };
    };
    return new Map(
      links
        .map(omitIneffectiveExtention)
        .map((it): [string, LinkEntity] => [it.path, it]),
    );
  }

  private injectView(props: Props) {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView === null) {
      return;
    }
    for (const container of getTargetElement(markdownView.containerEl)) {
      mountView(container, props);
    }
  }

  private removeView() {
    const markdownViews = this.app.workspace.getLeavesOfType("markdown");
    for (const markdownView of markdownViews) {
      for (const element of getTargetElement(
        // @ts-ignore
        markdownView.containerEl,
      )) {
        if (element) {
          element.remove();
        }
      }
    }
  }

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
