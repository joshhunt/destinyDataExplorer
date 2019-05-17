import PromiseWorker from "promise-worker";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./worker.js";

import { SEND_DEFINITIONS, SEARCH } from "./constants";

const worker = new Worker();
const promiseWorker = new PromiseWorker(worker);

const sentDefinitions = new WeakMap();

function toWorker(type, payload) {
  return promiseWorker.postMessage({ type, payload });
}

export function sendDefinitions(definitions) {
  sentDefinitions.set(definitions, true);
  return toWorker(SEND_DEFINITIONS, definitions);
}

export default async function search(searchString, definitions) {
  if (!sentDefinitions.has(definitions)) {
    console.log("Definitions not send, sending them now");
    await sendDefinitions(definitions);
  }

  return toWorker(SEARCH, searchString);
}
