// eslint-disable no-console
import React, { Component } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import store from "./store";
import ApiView from "./views/Api";
import Home from "./views/Home";

export default class AppRouter extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />

            <Route exact path="/api" component={ApiView} />

            <Route path="/i/*" component={Home} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}
