// eslint-disable no-console
import React, { Component } from "react";
import { Router, Route, browserHistory } from "react-router";
import { Provider } from "react-redux";

import store from "./store";
import Home from "./views/Home";
import DefinitionDiffs from "./views/DefinitionDiffs";

export default class AppRouter extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={browserHistory}>
          <Route path="/" component={Home} />
          <Route path="/i/*" component={Home} />
          <Route path="/diffs" component={DefinitionDiffs} />
        </Router>
      </Provider>
    );
  }
}
