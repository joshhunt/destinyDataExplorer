import { createStore, combineReducers } from 'redux';
import { mapValues } from 'lodash';

import app from './app';
import { fasterGetDefinitions } from 'src/lib/definitions';

import definitions, {
  setBulkDefinitions,
  definitionsStatus,
  definitionsError,
  SET_BULK_DEFINITIONS
} from './definitions';

const rootReducer = combineReducers({
  app,
  definitions
});

function sanitiseDefintionsState(defintionsState) {
  if (!defintionsState) {
    return defintionsState;
  }
  return mapValues(
    defintionsState,
    definitions =>
      `[${Object.keys(definitions || {}).length} definitions hidden]`
  );
}

const store = (window.__store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
      actionsBlacklist: [SET_BULK_DEFINITIONS],
      stateSanitizer: state => ({
        ...state,
        definitions: sanitiseDefintionsState(state.definitions)
      })
    })
));

const LANG_CODE = 'en';

fasterGetDefinitions(
  LANG_CODE,
  null,
  data => {
    store.dispatch(definitionsStatus(data));
  },
  (err, data) => {
    if (err) {
      console.error('Error loading definitions:', err);
      store.dispatch(definitionsError(err));
      return;
    }

    if (data && data.definitions) {
      store.dispatch(definitionsStatus({ status: null }));
      store.dispatch(setBulkDefinitions(data.definitions));
    }
  }
);

export default store;
