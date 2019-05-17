// worker.js
import registerPromiseWorker from "promise-worker/register";

import search from "src/lib/search";

import { SEND_DEFINITIONS, SEARCH } from "./constants";

let definitions;

registerPromiseWorker(({ type, payload }) => {
  console.log("worker recieved message", { type, payload });

  if (type === SEND_DEFINITIONS) {
    definitions = payload;
    console.log("got definitions", definitions);
    return Promise.resolve();
  }

  if (type === SEARCH) {
    const results = search(payload, {}, definitions);
    const ddd = results.map(obj => ({ ...obj, def: null }));

    console.log("sending results", ddd);
    return ddd;
  }

  return Promise.reject(new Error("Unknown message recived by worker"));
});
