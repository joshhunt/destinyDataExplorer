import "./devTools/devToolsApi"; // must be first
import "lib/ls";

import React from "react";
import ReactDOM from "react-dom";

import AppRouter from "./AppRouter";
import "./index.module.scss";

const render = (App) => {
  ReactDOM.render(<App />, document.getElementById("root"));
};

render(AppRouter);
