import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import { ReactView } from "./ReactView";

export const mountView = (element: Element) => {
  const root = createRoot(element);
  root.render(
    <React.StrictMode>
      <ReactView />
    </React.StrictMode>,
  );
};

export const unmountView = (element: Element) => {
  ReactDOM.unmountComponentAtNode(element);
};
