import "lib/autotrack.build";
import "lib/ls";
import _ from "lodash";

import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import AppRouter from "./AppRouter";
import "./index.module.scss";

window.lodash = _;

const render = App => {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById("root")
  );
};

render(AppRouter);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept("./AppRouter", () => render(AppRouter));
}
