import { DestinyManifest, getDestinyManifest } from "bungie-api-ts/destiny2";
import debugLib from "debug";
import pLimit from "p-limit";

import { store } from "../lib/DefinitionsStore";
import {
  DefinitionsProgressCallback,
  getDefinitionTable,
} from "../lib/bungieAPI";
import { httpClient } from "../lib/httpClient";
import {
  InitDefinitionsProgressEvent,
  ProgressRecord,
  StoredDefinition,
} from "../lib/types";

const BANNED_TABLES = [
  "DestinyInventoryItemLiteDefinition",
  "DestinyRewardSourceDefinition",
  "DestinyMetricDefinition",
];

const debug = debugLib("worker:loadDefinitions");
debug.enabled = true;

const limit = pLimit(3);

// OLD 118365.23.08.23.1700-1-bnet.51970
// CURRENT 118571.23.08.31.2000-1-bnet.51994

// const PRETEND_OLD: string | null = "118365.23.08.23.1700-1-bnet.51829";
const PRETEND_OLD: string | null = null;

type EmitProgressEvent = (ev: InitDefinitionsProgressEvent) => void;

export async function initDefinitions(emitProgress: EmitProgressEvent) {
  const manifestResp = await getDestinyManifest(httpClient);
  if (PRETEND_OLD) {
    // @ts-expect-error
    manifestResp.Response.version = PRETEND_OLD;
  }

  emitProgress({
    type: "version-known",
    version: manifestResp.Response.version,
  });

  const { version, loadedTables } = await loadDefinitions(
    manifestResp.Response,
    emitProgress
  );

  const allGenders: StoredDefinition[] = await store.getAllRowsForTable(
    "DestinyGenderDefinition"
  );
  const uniqueVersions = allGenders.filter((row, index, arr) => {
    return arr.findIndex((v) => v.version === row.version) === index;
  });

  console.group(
    "Before cleanup, have",
    uniqueVersions.length,
    "different versions in indexeddb"
  );
  for (const { key, version, ...restRow } of allGenders) {
    console.log(key, version, restRow);
  }
  console.groupEnd();

  await store.cleanupForVersion(version);

  console.group(
    "After cleanup, have",
    uniqueVersions.length,
    "different versions in indexeddb"
  );
  for (const { key, version, ...restRow } of allGenders) {
    console.log(key, version, restRow);
  }
  console.groupEnd();

  return { version, loadedTables };
}

async function loadDefinitions(
  manifest: DestinyManifest,
  cb: EmitProgressEvent
) {
  console.log("Loading definitions");

  const version = manifest.version;
  const components = Object.entries(
    manifest.jsonWorldComponentContentPaths.en
  ).filter(([tableName]) => !BANNED_TABLES.includes(tableName));

  let allProgress: ProgressRecord = {};
  function emitTableProgress(
    tableName: string,
    bytes: number,
    isLoaded: boolean
  ) {
    allProgress = {
      ...allProgress,
      [tableName]: [bytes, isLoaded],
    };

    cb({
      type: "table-progress",
      progress: allProgress,
    });
  }

  const promises = components.map(async ([tableName, defsPath]) => {
    return await limit(async () => {
      const defs = await loadTable(version, tableName, defsPath, (tableProg) =>
        emitTableProgress(tableName, tableProg.receivedLength, false)
      );

      emitTableProgress(tableName, 0, true);

      return [tableName, defs] as const;
    });
  });

  await Promise.all(promises);

  return {
    loadedTables: components.map((v) => v[0]),
    version: version,
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
  debug("got defs count", tableName, defsCount);

  if (defsCount > 0) {
    debug("Table already has definitions in idb", tableName);
    return;
  }

  emitProgress({ receivedLength: 0 });

  debug("Requesting table from network", tableName);
  const defs = await getDefinitionTable(defsPath, emitProgress);

  debug("Recieved table, storing in idb", tableName);
  await store.addDefinitions(version, tableName, Object.values(defs));
  debug("Table stored in idb", tableName);

  return defs;
}
