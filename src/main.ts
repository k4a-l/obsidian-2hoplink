import { MarkdownView, Plugin } from "obsidian";

import { toOriginalFowardLinks } from "./modules/convert";
import { getTargetElement } from "./modules/htmlElement";
import {
  getForwardLinks,
  getLinks,
  makeBacklinksMap,
  makeTwoHopLinks,
} from "./modules/make";
import {
  path2FileEntity,
  path2Name,
  removeBlockReference,
} from "./modules/utils";
import { SampleSettingTab } from "./setting";
import { mountView } from "./views/ReactView";

import type { TwohopLinkSettings } from "./setting";
import type { FileEntity, LinkEntity, TagLinks } from "./type";
import type { Props } from "./views/ReactView";
import type { CachedMetadata, EventRef, TFile } from "obsidian";
import type { Root } from "react-dom/client";

const DEFAULT_SETTINGS: TwohopLinkSettings = {
  excludesDuplicateLinks: true,
  excludeTag: false,
  effectiveExtension: [],
};

export default class TwohopLink extends Plugin {
  settings: TwohopLinkSettings;

  private eventRefs: EventRef[];

  private roots: Root[] = [];

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.eventRefs = [
      this.app.workspace.on("file-open", () => {
        console.log("open");
        this.render();
      }),
      this.app.metadataCache.on("resolve", file => {
        console.log("resolved");
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
    console.log("onunload");
    console.log(this.eventRefs);
    this.eventRefs.forEach(ref => this.app.metadataCache.offref(ref));

    this.removeView();
  }

  private render() {
    this.removeView();

    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView === null) {
      return;
    }

    const activeFile = markdownView.file;
    if (activeFile === null) {
      return;
    }

    const activeFileCache = this.app.metadataCache.getFileCache(activeFile);
    if (!activeFileCache) return;

    const b = (it: LinkEntity): [string, LinkEntity] => {
      const f = it.links.flatMap(f => {
        const file = this.app.metadataCache.getFirstLinkpathDest(
          f.path,
          it.path,
        );

        if (!file) return [];
        if (
          ["md", ...this.settings.effectiveExtension].contains(file.extension)
        )
          return f;
        return [];
      });
      return [it.path, { ...it, links: f }];
    };

    const resolvedFowardLinks = new Map(
      toOriginalFowardLinks(this.app.metadataCache.resolvedLinks).map(b),
    );
    const unresolvedFowardLinks = new Map(
      toOriginalFowardLinks(this.app.metadataCache.unresolvedLinks).map(b),
    );

    const backLinks = makeBacklinksMap({
      resolvedLinks: resolvedFowardLinks,
      unresolvedLinks: unresolvedFowardLinks,
    });

    const fowardLinks = getForwardLinks(activeFile, activeFileCache);

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

    const forwardResolvedLinks = fowardLinks
      .flatMap(l => {
        const links = getLinks(activeFile.path, resolvedFowardLinks);
        const file = this.app.metadataCache.getFirstLinkpathDest(
          l.path,
          activeFile.path,
        );
        const link = links.find(it => it.path === file?.path);

        return link ? link : [];
      })
      .filter(it => isFirst(it.path));

    const backwardConnectedLinks: FileEntity[] = getLinks(
      activeFile.path,
      backLinks,
    )
      .map(link => path2FileEntity(link))
      .filter(it => isFirst(it.path));

    const resolvedTwoHopLinks = makeTwoHopLinks(
      activeFile.path,
      resolvedFowardLinks,
      backLinks,
      "foward",
    );

    const unresolvedTwoHopLinks = makeTwoHopLinks(
      activeFile.path,
      unresolvedFowardLinks,
      backLinks,
      "foward",
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

    const newLinks = fowardLinks.filter(l => {
      const links = getLinks(activeFile.path, unresolvedFowardLinks);
      return links.find(it => it.path === l.path);
    });

    const tagLinksList = this.getTagLinksList(activeFile, activeFileCache);

    this.injectView({
      sourcePath: activeFile.path,
      forwardResolvedLinks,
      backwardConnectedLinks,
      twohopLinks: [...twohopMap.values()],
      tagLinksList,
      newLinks,
      onClick: this.openFile.bind(this),
    });
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
  ): TagLinks[] {
    if (!activeFileCache.tags) return [];

    const activeFileTagSet = new Set(activeFileCache.tags.map(it => it.tag));
    const tagMap: Record<string, string[]> = {};
    for (const markdownFile of this.app.vault.getMarkdownFiles()) {
      if (markdownFile === activeFile) {
        continue;
      }
      const cachedMetadata = this.app.metadataCache.getFileCache(markdownFile);

      if (!cachedMetadata || !cachedMetadata.tags) continue;

      for (const tag of cachedMetadata.tags.filter(it =>
        activeFileTagSet.has(it.tag),
      )) {
        if (!tagMap[tag.tag]) {
          tagMap[tag.tag] = [];
        }
        tagMap[tag.tag].push(path2Name(markdownFile.path));
      }
    }

    const tagLinksList: TagLinks[] = [];
    for (const tagMapKey of Object.keys(tagMap)) {
      tagLinksList.push({ tag: tagMapKey, links: tagMap[tagMapKey] });
    }
    return tagLinksList;
  }

  private injectView(props: Props) {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView === null) {
      return;
    }
    for (const container of getTargetElement(markdownView.containerEl)) {
      this.roots.push(mountView(container, props));
    }
  }

  private removeView() {
    this.roots.forEach(root => {
      root.unmount();
    });
    this.roots = [];

    // const markdownViews = this.app.workspace.getLeavesOfType("markdown");
    // for (const markdownView of markdownViews) {
    //   for (const element of getTargetElement(markdownView.view.containerEl)) {
    //     if (element) {
    //       element.remove();
    //     }
    //   }
    // }
  }

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
