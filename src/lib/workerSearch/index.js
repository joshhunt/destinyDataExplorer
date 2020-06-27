import PromiseWorker from "promise-worker";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./worker.js";

import { SEND_DEFINITIONS, SEARCH } from "./constants";

const worker = new Worker();
const promiseWorker = new PromiseWorker(worker);

const sentDefinitions = new WeakMap();

function deferred() {
  const dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });

  return dfd;
}

function toWorker(type, payload) {
  return promiseWorker.postMessage({ type, payload });
}

export function sendDefinitions(definitions) {
  if (!definitions) {
    return;
  }

  const existingPromise = sentDefinitions.get(definitions);

  if (existingPromise) {
    return existingPromise;
  }

  const dfd = deferred();
  sentDefinitions.set(definitions, dfd.promise);

  return toWorker(SEND_DEFINITIONS, definitions)
    .then(() => dfd.resolve())
    .then(() => dfd.promise);
}

export default async function search(filterPayload, definitions) {
  if (!sentDefinitions.has(definitions)) {
    console.log("Definitions not send, sending them now");
    sendDefinitions(definitions);
  }

  await sentDefinitions.get(definitions);

  return toWorker(SEARCH, filterPayload);
}
