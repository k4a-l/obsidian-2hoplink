import { MarkdownView, Plugin } from "obsidian";

import { getTargetElement } from "./modules/htmlElement";
import { SampleSettingTab } from "./setting";
import { mountView } from "./views/mount";

import type { MyPluginSettings } from "./setting";

// Remember to rename these classes and interfaces!

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: "default",
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SampleSettingTab(this.app, this));

    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView === null) {
      return;
    }

    const activeFile = markdownView.file;
    if (activeFile === null) {
      return;
    }

    const activeFileCache = this.app.metadataCache.getFileCache(activeFile);

    this.injectView();
  }

  // eslint-disable-next-line class-methods-use-this
  onunload() {
    this.removeView();
  }

  private injectView() {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView === null) {
      return;
    }
    for (const container of getTargetElement(markdownView.containerEl)) {
      mountView(container);
    }
  }

  private removeView() {
    const markdownViews = this.app.workspace.getLeavesOfType("markdown");
    for (const markdownView of markdownViews) {
      for (const element of getTargetElement(markdownView.view.containerEl)) {
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
