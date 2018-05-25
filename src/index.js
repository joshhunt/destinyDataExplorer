import 'app/lib/autotrack.build';
import 'app/lib/ls';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import AppRouter from './AppRouter';
import './index.styl';

const render = App => {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById('root')
  );
};

render(AppRouter);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./AppRouter', () => render(AppRouter));
}
