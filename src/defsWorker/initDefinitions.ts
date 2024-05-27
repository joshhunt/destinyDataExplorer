import { DestinyManifest, getDestinyManifest } from "bungie-api-ts/destiny2";
import pLimit from "p-limit";

import { store } from "../lib/DefinitionsStore";
import {
  DefinitionsProgressCallback,
  getDefinitionTable,
} from "../lib/bungieAPI";
import { createDebug } from "../lib/debug";
import { httpClient } from "../lib/httpClient";
import { InitDefinitionsProgressEvent, ProgressRecord } from "../lib/types";

const BANNED_TABLES = [
  "DestinyInventoryItemLiteDefinition",
  "DestinyRewardSourceDefinition",
  "DestinyMetricDefinition",
];

const ALLOWED_TABLES: string[] = [
  // "DestinyGenderDefinition",
  // "DestinyRaceDefinition",
  // "DestinyClassDefinition",
  // "DestinyPlaceDefinition",
];

const debug = createDebug("loadDefinitions");

const limit = pLimit(3);

type EmitProgressEvent = (ev: InitDefinitionsProgressEvent) => void;

export async function initDefinitions(
  emitProgress: EmitProgressEvent,
  pretendVersion?: string
) {
  const manifestResp = await getDestinyManifest(httpClient);
  if (pretendVersion) {
    // @ts-expect-error
    manifestResp.Response.version = pretendVersion;
  }

  emitProgress({
    type: "version-known",
    version: manifestResp.Response.version,
  });

  const { version, loadedTables } = await loadDefinitions(
    manifestResp.Response,
    emitProgress
  );

  console.time("defs cleanup");
  await store.cleanupForVersion(version);
  console.timeEnd("defs cleanup");

  return { version, loadedTables };
}

async function loadDefinitions(
  manifest: DestinyManifest,
  cb: EmitProgressEvent
) {
  debug("Loading definitions");

  const version = manifest.version;
  const components = Object.entries(
    manifest.jsonWorldComponentContentPaths.en
  ).filter(([tableName]) => {
    if (ALLOWED_TABLES.length > 0) {
      return ALLOWED_TABLES.includes(tableName);
    }

    return !BANNED_TABLES.includes(tableName);
  });

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
