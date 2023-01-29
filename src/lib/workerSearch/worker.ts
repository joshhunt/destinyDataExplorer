import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import { getStoredDefinitions } from "lib/definitions/store";
import registerPromiseWorker from "promise-worker/register";

import search from "../search";

import {
  LoadDefinitionsWorkerMessage,
  LOAD_DEFINITIONS,
  SEARCH,
  SearchWorkerMessage,
  WorkerMessage,
} from "./constants";

let definitions: AllDestinyManifestComponents;

async function loadDefinitions(
  payload: LoadDefinitionsWorkerMessage["payload"]
) {
  const storedDefinitions = (await getStoredDefinitions()).filter(
    (v) => v.version === payload.manifestVersion
  );

  definitions = {} as AllDestinyManifestComponents;

  for (const storedDef of storedDefinitions) {
    definitions[storedDef.tableName as keyof AllDestinyManifestComponents] =
      storedDef.definitions;
  }

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

registerPromiseWorker((msg: WorkerMessage): Promise<any> => {
  if (msg.type === LOAD_DEFINITIONS) {
    return loadDefinitions(msg.payload);
  }

  if (msg.type === SEARCH) {
    return doSearch(msg.payload);
  }

  return Promise.reject(new Error("Unknown message recived by worker"));
});
