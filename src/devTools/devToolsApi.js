import { filter as lodashFilter, isObject, isArray, isString } from "lodash";

import { SET_SEARCH_RESULTS } from "../store/filter";

class ResultsArray extends Array {
  show() {
    show(ResultsArray.store, this);
  }
}

function filter(store, obj, fn) {
  const results = lodashFilter(obj, (item) => {
    try {
      return fn(item);
    } catch (err) {
      console.error(
        "Ignoring error running filter function on definition",
        item
      );
      console.error(err);
      return false;
    }
  });

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
