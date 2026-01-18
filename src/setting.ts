import type { App } from "obsidian";
import { PluginSettingTab, Setting } from "obsidian";
import type TwohopLink from "./main";

export interface TwohopLinkSettings {
  effectiveExtension: string[];
  excludesDuplicateLinks: boolean;
  excludeTag: boolean;
}

export class SampleSettingTab extends PluginSettingTab {
  plugin: TwohopLink;

  constructor(app: App, plugin: TwohopLink) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Excludes duplicates links")
      .setDesc(
        "If two or more links have the same 2hop links, merge the link displays into one.",
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.excludesDuplicateLinks)
          .onChange(async (value) => {
            this.plugin.settings.excludesDuplicateLinks = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Effective extentions")

      .addText((toggle) => {
        toggle
          .setValue(this.plugin.settings.effectiveExtension.join(","))
          .onChange(async (value) => {
            this.plugin.settings.effectiveExtension = value.split(",");
            await this.plugin.saveSettings();
          });
      });

    const excludeLinkTitle = ["excludeTag"] as const;
    excludeLinkTitle.forEach((title) => {
      if (typeof this.plugin.settings[title] === "boolean") {
        new Setting(containerEl).setName(title).addToggle((toggle) => {
          toggle
            .setValue(this.plugin.settings[title])
            .onChange(async (value) => {
              this.plugin.settings[title] = value;
              await this.plugin.saveSettings();
            });
        });
      }
    });
  }
}
