import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { mapValues } from "lodash";
import querystring from "querystring";
import reduxThunk from "redux-thunk";

import { setLanguage, getLanguage } from "lib/ls";
import { getDefinitions } from "lib/definitions";
import { sendDefinitions } from "lib/workerSearch";

import { connectToWindow } from "../devTools/devToolsApi";

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
import filter from "./filter";

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

connectToWindow(store);

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
  getDefinitions(
    langCode,
    (err, data) => {
      if (err) {
        console.error("Error loading definitions:", err);
        store.dispatch(definitionsError(err));

        store.dispatch(startingSearchWorker());
        sendDefinitions(undefined).then(() => {
          store.dispatch(startingSearchWorkerSuccess());
        });

        return;
      }

      if (data && data.done) {
        store.dispatch(
          definitionsStatus({
            status: null,
            manifestVersion: data.manifestVersion,
          })
        );

        store.dispatch(startingSearchWorker());
        sendDefinitions(data.manifestVersion).then(() => {
          store.dispatch(startingSearchWorkerSuccess());
        });
      }

      if (data && data.definitions) {
        store.dispatch(setBulkDefinitions(data.definitions));
      }
    },
    (data) => {
      store.dispatch(definitionsStatus(data));
    }
  );
}

export default store;
