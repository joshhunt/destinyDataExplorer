import { createStore, combineReducers } from 'redux';

import app from './app';
import definitions, { SET_BULK_DEFINITIONS } from './definitions';

const rootReducer = combineReducers({
  app,
  definitions
});

const store = (window.__store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
      actionsBlacklist: [SET_BULK_DEFINITIONS],
      stateSanitizer: state => ({
        ...state,
        definitions: state.definitions ? '[hidden]' : state.definitions
      })
    })
));

export default store;
