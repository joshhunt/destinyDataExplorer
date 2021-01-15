// eslint-disable no-console
import React, { Component } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import OAuthReturn from "views/OAuthReturn";

import store from "./store";
import ApiView from "./views/Api";
import ApiRequestView from "./views/ApiRequest";
import Home from "./views/Home";

export default class AppRouter extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />

            <Route exact path="/list-api" component={ApiView} />

            <Route exact path="/api" component={ApiRequestView} />

            <Route
              exact
              path="/api/:operationName"
              component={ApiRequestView}
            />
            <Route
              exact
              path="/api/:operationName/**"
              component={ApiRequestView}
            />

            <Route exact path="/oauth-return" component={OAuthReturn} />

            <Route path="/i/*" component={Home} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}
