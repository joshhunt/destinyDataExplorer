import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { mapValues } from "lodash";
import querystring from "querystring";
import reduxThunk from "redux-thunk";

import app, { startingSearchWorker, startingSearchWorkerSuccess } from "./app";
import filter from "./filter";
import { fasterGetDefinitions } from "src/lib/definitions";
import { sendDefinitions } from "src/lib/workerSearch";

import definitions, {
  setBulkDefinitions,
  definitionsStatus,
  definitionsError,
  SET_BULK_DEFINITIONS
} from "./definitions";

const rootReducer = combineReducers({
  app,
  definitions,
  filter
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

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionsBlacklist: [SET_BULK_DEFINITIONS],
        stateSanitizer: state => ({
          ...state,
          definitions: sanitiseDefintionsState(state.definitions)
        })
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

const store = createStore(rootReducer, enhancer);

window.__store = store;

const qs = querystring.parse(window.location.search.substr(1));
const languages = [
  'de',
  'en',
  'es',
  'es-mx',
  'fr',
  'it',
  'ja',
  'ko',
  'pl',
  'pt-br',
  'ru',
  'zh-chs',
  'zh-cht'
];
const LANG_CODE = languages.includes(qs.lang) ? qs.lang : "en";

store.subscribe(() => {
  window.__state = store.getState();
  window.__definitions = window.__state.definitions;
});

fasterGetDefinitions(
  LANG_CODE,
  null,
  data => {
    store.dispatch(definitionsStatus(data));
  },
  (err, data) => {
    if (err) {
      console.error("Error loading definitions:", err);
      store.dispatch(definitionsError(err));
      return;
    }

    if (data && data.definitions) {
      store.dispatch(definitionsStatus({ status: null }));
      store.dispatch(setBulkDefinitions(data.definitions));

      store.dispatch(startingSearchWorker());

      window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          const defs = store.getState().definitions;

          sendDefinitions(defs).then(() => {
            store.dispatch(startingSearchWorkerSuccess());
          });
        });
      }, 1000);
    }
  }
);

export default store;
