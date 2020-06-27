import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { mapValues, isObject, forEach } from "lodash";
import querystring from "querystring";
import reduxThunk from "redux-thunk";

import { setLanguage, getLanguage } from "lib/ls";
import { fasterGetDefinitions } from "lib/definitions";
import { sendDefinitions } from "lib/workerSearch";

import app, {
  startingSearchWorker,
  startingSearchWorkerSuccess,
  setActiveLanguage,
} from "./app";
import definitions, {
  setBulkDefinitions,
  definitionsStatus,
  definitionsError,
  SET_BULK_DEFINITIONS,
} from "./definitions";
import filter, { SET_SEARCH_RESULTS } from "./filter";

const rootReducer = combineReducers({
  app,
  definitions,
  filter,
});

function sanitiseDefintionsState(defintionsState) {
  if (!defintionsState) {
    return defintionsState;
  }
  return mapValues(
    defintionsState,
    (definitions) =>
      `[${Object.keys(definitions || {}).length} definitions hidden]`
  );
}

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionsBlacklist: [SET_BULK_DEFINITIONS],
        stateSanitizer: (state) => ({
          ...state,
          definitions: {
            ...state.definitions,
            definitions: sanitiseDefintionsState(state.definitions.definitions),
          },
        }),
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

const store = createStore(rootReducer, enhancer);

window.__store = store;

function makeSearchResults(def) {
  const hash = def.hash;
  const type = def.$type;

  return {
    dxId: `${type}:${hash}`,
    type: type,
    key: hash,
  };
}

window.__show = (input) => {
  const results = input.flatMap((thing) => {
    let defs = [];

    if (isObject(thing)) {
      defs.push(makeSearchResults(thing));
    } else {
      const state = store.getState();

      forEach(state.definitions.definitions, (defsForTable, tableName) => {
        forEach(defsForTable, (singleDef) => {
          if (singleDef.hash === thing) {
            defs.push(makeSearchResults(singleDef));
          }
        });
      });
    }

    return defs;
  });

  store.dispatch({
    type: SET_SEARCH_RESULTS,
    payload: results,
  });
};

const qs = querystring.parse(window.location.search.substr(1));
const languages = [
  "de",
  "en",
  "es",
  "es-mx",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "pt-br",
  "ru",
  "zh-chs",
  "zh-cht",
];
const baseLang = qs.lang || getLanguage();
const LANG_CODE = languages.includes(baseLang) ? baseLang : "en";

let prevState = store.getState();
store.subscribe(() => {
  const newState = store.getState();
  window.__state = newState;
  window.__definitions = newState.definitions.definitions;

  const toDispatch = [];

  if (prevState.app.activeLanguage !== newState.app.activeLanguage) {
    if (prevState.app.activeLanguage) {
      toDispatch.push(definitionsStatus({ status: "loading new language" }));
    }

    setLanguage(newState.app.activeLanguage);
    loadDefinitions(newState.app.activeLanguage);
  }

  prevState = newState;

  toDispatch.forEach((action) => store.dispatch(action));
});

store.dispatch(setActiveLanguage(LANG_CODE));

function loadDefinitions(langCode) {
  fasterGetDefinitions(
    langCode,
    null,
    (data) => {
      store.dispatch(definitionsStatus(data));
    },
    (err, data) => {
      if (err) {
        console.error("Error loading definitions:", err);
        store.dispatch(definitionsError(err));
        return;
      }

      if (data && data.done) {
        store.dispatch(definitionsStatus({ status: null }));
      }

      if (data && data.definitions) {
        store.dispatch(setBulkDefinitions(data.definitions));

        store.dispatch(startingSearchWorker());

        window.setTimeout(() => {
          window.requestAnimationFrame(() => {
            const defs = store.getState().definitions.definitions;

            sendDefinitions(defs).then(() => {
              store.dispatch(startingSearchWorkerSuccess());
            });
          });
        }, 1000);
      }
    }
  );
}

export default store;
