import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import { getStoredDefinitions } from "lib/definitions/store";
import registerPromiseWorker from "promise-worker/register";

// @ts-ignore
import assignDeep from "assign-deep";

import search from "../search";

import {
  LoadDefinitionsWorkerMessage,
  LoadExtraDefinitionsWorkerMessage,
  LOAD_DEFINITIONS,
  LOAD_EXTRA_DEFINITIONS,
  SEARCH,
  SearchWorkerMessage,
  WorkerMessage,
} from "./constants";

let definitions: AllDestinyManifestComponents;

async function loadDefinitions(
  payload: LoadDefinitionsWorkerMessage["payload"]
) {
  let storedDefinitions = await getStoredDefinitions();

  if (payload.manifestVersion) {
    storedDefinitions = storedDefinitions.filter(
      (v) => v.version === payload.manifestVersion
    );
  }

  definitions = {} as AllDestinyManifestComponents;

  for (const storedDef of storedDefinitions) {
    definitions[storedDef.tableName as keyof AllDestinyManifestComponents] =
      storedDef.definitions;
  }

  return Promise.resolve();
}

function loadExtraDefinitions(
  payload: LoadExtraDefinitionsWorkerMessage["payload"]
) {
  definitions = assignDeep(definitions, payload.definitions);

  return Promise.resolve();
}

async function doSearch(payload: SearchWorkerMessage["payload"]) {
  if (!definitions) {
    return Promise.reject(
      new Error("Definitions have not been loaded by worker yet")
    );
  }

  const results = search(payload.searchString, payload.filters, definitions);
  return results.map((obj) => ({ ...obj, def: null }));
}

registerPromiseWorker((msg: WorkerMessage): Promise<unknown> => {
  if (msg.type === LOAD_DEFINITIONS) {
    return loadDefinitions(msg.payload);
  }

  if (msg.type === SEARCH) {
    return doSearch(msg.payload);
  }

  if (msg.type === LOAD_EXTRA_DEFINITIONS) {
    return loadExtraDefinitions(msg.payload);
  }

  return Promise.reject(new Error("Unknown message recived by worker"));
});
