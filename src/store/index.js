import { createStore, combineReducers } from 'redux';

import app from './app';
import definitions from './definitions';

const rootReducer = combineReducers({
  app,
  definitions
});

const store = (window.__store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
));

export default store;
