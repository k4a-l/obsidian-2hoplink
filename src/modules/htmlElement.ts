const CONTAINER_CLASS = "twohop-links-container";

export const getTargetElement = (containerEl: HTMLElement): Element[] => {
  const elements = containerEl.querySelectorAll(
    `div:not(.markdown-embed-content) > .markdown-source-view .cm-sizer`,
  );

  const containers: Element[] = [];
  for (let i = 0; i < elements.length; i += 1) {
    const el = elements.item(i);
    const container =
      el.querySelector(`.${CONTAINER_CLASS}`) ||
      el.createDiv({ cls: CONTAINER_CLASS });
    containers.push(container);
  }
  return containers;
};
