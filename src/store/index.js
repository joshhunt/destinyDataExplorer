import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { mapValues, isObject, isString, isNumber } from "lodash";
import querystring from "querystring";
import reduxThunk from "redux-thunk";

import app, {
  startingSearchWorker,
  startingSearchWorkerSuccess,
  setActiveLanguage,
} from "./app";
import filter from "./filter";
import { setLanguage, getLanguage } from "lib/ls";
import { fasterGetDefinitions } from "lib/definitions";
import { sendDefinitions } from "lib/workerSearch";

import definitions, {
  setBulkDefinitions,
  definitionsStatus,
  definitionsError,
  SET_BULK_DEFINITIONS,
} from "./definitions";

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
          definitions: sanitiseDefintionsState(state.definitions.definitions),
        }),
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

const store = createStore(rootReducer, enhancer);

window.__store = store;

window.__show = (input) => {
  const results = input.map((thing) => {
    if (isNumber(thing) || isString(thing)) {
      // assume it's a hash
      return { key: thing };
    }

    const hash = input.hash;
    const type = input.$type;

    return {
      dxId: `${type}:${hash}`,
      type: type,
      key: hash,
    };
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
