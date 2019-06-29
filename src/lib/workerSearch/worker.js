// worker.js
import registerPromiseWorker from "promise-worker/register";

import search from "src/lib/search";

import { SEND_DEFINITIONS, SEARCH } from "./constants";

let definitions;

registerPromiseWorker(({ type, payload }) => {
  console.log("<<< Worker recieved", { type, payload });
  if (type === SEND_DEFINITIONS) {
    definitions = payload;
    return Promise.resolve();
  }

  if (type === SEARCH) {
    const results = search(payload.searchString, payload.filters, definitions);
    return results.map(obj => ({ ...obj, def: null }));
  }

  return Promise.reject(new Error("Unknown message recived by worker"));
});
