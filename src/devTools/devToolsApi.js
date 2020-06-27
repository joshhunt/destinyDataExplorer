import { filter as lodashFilter, isObject, isArray, isString } from "lodash";

import { SET_SEARCH_RESULTS } from "../store/filter";
import css from "./cssLog";

class ResultsArray extends Array {
  show() {
    show(ResultsArray.store, this);

    return this;
  }
}

function filter(store, obj, fn) {
  const errors = [];
  window.$errors = errors;

  const results = lodashFilter(obj, (item) => {
    try {
      return fn(item);
    } catch (err) {
      errors.push({
        definition: item,
        error: err,
      });
      return false;
    }
  });

  if (errors.length) {
    console.error(
      "There were",
      errors.length,
      "items that threw an exception when trying to filter, which have not been included. See all the errors on window.$errors."
    );
  }

  ResultsArray.store = store;
  return ResultsArray.from(results);
}

function show(store, _input) {
  const input = isArray(_input) ? _input : [_input];

  const results = input.flatMap((thing) => {
    let innerResults = [];

    if (isObject(thing)) {
      innerResults.push(makeSearchResults(thing));
    } else {
      const state = store.getState();
      const hash = isString(thing) ? parseInt(thing) : thing;

      Object.values(state.definitions.definitions).forEach((defsForTable) => {
        Object.values(defsForTable).forEach((singleDef) => {
          if (singleDef.hash === hash || singleDef.statId === thing) {
            innerResults.push(makeSearchResults(singleDef));
          }
        });
      });
    }

    return innerResults;
  });

  store.dispatch({
    type: SET_SEARCH_RESULTS,
    payload: results,
  });
}

function makeSearchResults(def) {
  const hash = def.hash;
  const type = def.$type;

  return {
    dxId: `${type}:${hash}`,
    type: type,
    key: hash,
  };
}

const prevKeeper = new WeakMap();
export function connectToWindow(store) {
  window.__store = store;
  window.$show = show.bind(null, store);
  window.$filter = filter.bind(null, store);

  store.subscribe(
    catchErrors(() => {
      const newState = store.getState();
      window.__state = newState;
      window.__definitions = newState.definitions.definitions;

      if (
        newState.definitions.definitions &&
        !prevKeeper.has(newState.definitions.definitions)
      ) {
        prevKeeper.set(newState.definitions.definitions, true);

        Object.entries(newState.definitions.definitions).forEach(
          ([tableName, defs]) => {
            const windowKeyName = `$${tableName}`;
            window[windowKeyName] = { ...defs };

            window[windowKeyName].filter = filter.bind(null, store, defs);
          }
        );
      }
    })
  );
}

function catchErrors(fn) {
  return (...args) => {
    try {
      fn(...args);
    } catch (err) {
      console.error("Caught error, but continued on");
      console.error(err);
    }
  };
}

const CODE_CSS =
  "background: black; padding: 2px; display: inline-block; font-family: monospace";

css.log(`
${css("", "font-family: sans-serif")}${css(
  "Welcome to the Destiny Data Explorer!",
  "font-weight: bold; background: #8e44ad; color: white; padding: 2px; font-size: 1.2em"
)}

There are a few handy utils installed here for more advanced querying. Each of the definitions are available on window:

    ${css("window.$DestinyInventoryItemDefinition", CODE_CSS)}

Each table has a filter function, to easily filter each of the definitions:

    ${css(
      "window.$DestinyInventoryItemDefinition.filter(v => v.itemCategoryHashes.includes(3109687656))",
      CODE_CSS
    )}

You can call .show() on the results to display them in the Data Explorer UI:

    ${css(
      "window.$DestinyInventoryItemDefinition.filter(v => v.itemCategoryHashes.includes(3109687656)).show()",
      CODE_CSS
    )}

Enjoy :)
`);
