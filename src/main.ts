import { Plugin } from "obsidian";

import { SampleSettingTab } from "./setting";

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

    console.log(this.app.vault);
    console.log(this.app.metadataCache);
  }

  // eslint-disable-next-line class-methods-use-this
  onunload() {}

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
