import { getDestinyManifest } from "bungie-api-ts/destiny2";
import debugLib from "debug";
import pLimit from "p-limit";

import { store } from "../lib/DefinitionsStore";
import {
  DefinitionsProgressCallback,
  getDefinitionTable,
} from "../lib/bungieAPI";
import { httpClient } from "../lib/httpClient";
import { ProgressRecord } from "../lib/types";

const BANNED_TABLES = [
  "DestinyInventoryItemLiteDefinition",
  "DestinyRewardSourceDefinition",
  "DestinyMetricDefinition",
];

const debug = debugLib("worker:loadDefinitions");
debug.enabled = true;

const limit = pLimit(3);

export async function loadDefinitions(cb: (progress: ProgressRecord) => void) {
  console.log("Loading definitions");
  const manifest = await getDestinyManifest(httpClient);

  const version = manifest.Response.version;

  const components = Object.entries(
    manifest.Response.jsonWorldComponentContentPaths.en
  )
    .filter(([tableName]) => !BANNED_TABLES.includes(tableName))
    // .filter(
    //   ([tableName], index) => tableName === "DestinyInventoryItemDefinition"
    //   // tableName === "DestinyActivityDefinition" ||
    //   // tableName === "DestinyRecordDefinition" ||
    //   // tableName === "DestinyObjectiveDefinition" ||
    //   // index < 5
    // )
    .filter(
      ([tableName], index) =>
        tableName === "DestinyInventoryItemDefinition" || index < 150
    );

  let allProgress: ProgressRecord = {};
  function updateProgress(tableName: string, bytes: number, isLoaded: boolean) {
    allProgress = {
      ...allProgress,
      [tableName]: [bytes, isLoaded],
    };

    cb(allProgress);
  }

  const promises = components.map(async ([tableName, defsPath]) => {
    return await limit(async () => {
      updateProgress(tableName, 0, false);

      const defs = await loadTable(version, tableName, defsPath, (tableProg) =>
        updateProgress(tableName, tableProg.receivedLength, false)
      );

      updateProgress(tableName, 0, true);

      return [tableName, defs] as const;
    });
  });

  await Promise.all(promises);

  return {
    loadedTables: components.map((v) => v[0]),
    version: manifest.Response.version,
  };
}

async function loadTable(
  version: string,
  tableName: string,
  defsPath: string,
  emitProgress: DefinitionsProgressCallback
) {
  debug("Loading table", tableName);
  const defsCount = (await store.countForTable(version, tableName)) ?? -1;

  if (defsCount > 0) {
    debug("Table already has definitions in idb", tableName);
    return;
  }

  debug("Requesting table from network", tableName);
  const defs = await getDefinitionTable(defsPath, emitProgress);

  debug("Recieved table, storing in idb", tableName);
  await store.addDefinitions(version, tableName, Object.values(defs));
  debug("Table stored in idb", tableName);

  return defs;
}
