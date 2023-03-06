import Deferred from "lib/Deferred";
import { DefinitionTable } from "lib/definitions/store";
import PromiseWorker from "promise-worker";

import {
  LOAD_DEFINITIONS,
  LOAD_EXTRA_DEFINITIONS,
  SEARCH,
  WorkerMessage,
} from "./constants";

const worker = new Worker("./worker", { type: "module" });
const promiseWorker = new PromiseWorker(worker);

function toWorker(message: WorkerMessage) {
  return promiseWorker.postMessage(message);
}

const sendDefsDeferred = new Deferred<void>();
let hasSentDefs = false;
let workerReady = false;

export async function sendDefinitions(manifestVersion: string) {
  if (hasSentDefs) {
    return sendDefsDeferred.promise;
  }

  hasSentDefs = true;

  await toWorker({ type: LOAD_DEFINITIONS, payload: { manifestVersion } });
  sendDefsDeferred.resolve();
  workerReady = true;

  return sendDefsDeferred.promise;
}

export async function sendExtraDefinitions(
  definitions: Record<string, DefinitionTable>
) {
  if (!workerReady) {
    await sendDefsDeferred.promise;
  }

  return toWorker({ type: LOAD_EXTRA_DEFINITIONS, payload: { definitions } });
}

export default async function search(filterPayload: any) {
  if (!workerReady) {
    await sendDefsDeferred.promise;
  }

  return toWorker({ type: SEARCH, payload: filterPayload });
}
