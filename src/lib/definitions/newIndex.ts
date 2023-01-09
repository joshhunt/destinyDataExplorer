import axios from "axios";
import { DestinyManifest } from "bungie-api-ts/destiny2";
import Dexie from "dexie";
import {
  createStore,
  keys,
  setMany as idbSetMany,
  get as idbGet,
  entries as idbEntries,
} from "idb-keyval";
import { getDestiny } from "lib/destiny";
import asyncPool from "tiny-async-pool";
import { getAllRecords, requireDatabase } from "./database";

import "imports-loader?wrapper=window!@destiny-item-manager/zip.js"; // eslint-disable-line

/// @ts-ignore
import inflate from "file-loader!@destiny-item-manager/zip.js/WebContent/inflate.js"; // eslint-disable-line

/// @ts-ignore
import zipWorker from "file-loader!@destiny-item-manager/zip.js/WebContent/z-worker.js"; // eslint-disable-line

declare var zip: any;

const log = require("lib/log")("definitions");

log("Creating custom idb-keyval store");
const idbStore = createStore("data-explorer", "definitions");
log("Deleting old destinyManifest dexie store");
Dexie.delete("destinyManifest");
log("Deleting old destinyDefinitions dexie store");
Dexie.delete("destinyDefinitions");
log("Done db setup");

type GenericDefinition = any;
type DefinitionTable = Record<string, GenericDefinition>;

enum ProgressStatus {
  Downloading,
  ExtractingTables,
  Unzipping,
  Done,
  LoadingJSONTables,
}

interface DataCallbackCallback {
  definitions?: Record<string, DefinitionTable>;
  done: boolean;
}

interface ProgressPayload {
  status: ProgressStatus;
}

type DataCallback = (err: Error | null, payload: DataCallbackCallback) => void;
type ProgressCallback = (progress: ProgressPayload) => void;

interface StoredDefinition {
  tableName: string;
  version: string;
  definitions: DefinitionTable;
}

const BANNED_TABLE_NAMES = ["DestinyInventoryItemLiteDefinition"];

function isStoredDefinition(obj: any): obj is StoredDefinition {
  return (
    obj &&
    typeof obj.tableName === "string" &&
    typeof obj.version === "string" &&
    typeof obj.definitions === "object"
  );
}

function storedDefinitionsToPayload(
  stored: StoredDefinition[],
  done: boolean
): DataCallbackCallback {
  const payload: DataCallbackCallback = {
    definitions: {},
    done,
  };

  for (const storedDef of stored) {
    payload.definitions![storedDef.tableName] = storedDef.definitions;
  }

  return payload;
}

const USE_GET_MANY = false; // Firefox dies with entries() so we can't use iut
const GET_SINGLE_CONCURRENCY = 5;

async function getFromIdbGetSingle(): Promise<StoredDefinition[]> {
  log("Using keys() + get() to get 3 from idb at a time");

  const existingKeys = await keys(idbStore);

  const loadDefinitionFromIdb = (idbKey: IDBValidKey) =>
    idbGet(idbKey, idbStore);

  const results = await asyncPool(
    GET_SINGLE_CONCURRENCY,
    existingKeys,
    loadDefinitionFromIdb
  );

  return results.filter(isStoredDefinition);
}

async function getFromIdbGetMany(): Promise<StoredDefinition[]> {
  log("Using entries() to get everythig from idb at once");

  const entries = await idbEntries(idbStore);
  const values = entries.map((v) => v[1]);
  return values.filter(isStoredDefinition);
}

function getStoredDefinitions(): Promise<StoredDefinition[]> {
  if (USE_GET_MANY) {
    return getFromIdbGetMany();
  } else {
    return getFromIdbGetSingle();
  }
}

export async function getDefinitions(
  language: string,
  dataCallback: DataCallback,
  progressCallback: ProgressCallback
) {
  log("Loading definitions", { language });

  log("Fetching manifest for later");
  const manifestPromise = getDestiny("/Platform/Destiny2/Manifest/", {
    _noAuth: true,
  });

  log("Loading existing definitions from idb");
  const idbLoadStart = performance.now();
  const existingDefinitions = await getStoredDefinitions();
  const idbLoadEnd = performance.now();

  log("Loaded existing definitions from idb", {
    timeMs: idbLoadEnd - idbLoadStart,
    tables: existingDefinitions.map((v) => ({
      tableName: v.tableName,
      version: v.version,
    })),
  });

  dataCallback(null, storedDefinitionsToPayload(existingDefinitions, false));

  log("Waiting for manifest to load");
  const manifest: DestinyManifest = await manifestPromise;

  const version = manifest.version;
  const allCurrentVersion =
    existingDefinitions.length > 1 &&
    existingDefinitions.every((v) => v.version === version);

  if (allCurrentVersion) {
    log("All definitions are current, finishing!");
    return dataCallback(null, { done: true });
  }

  const sqlitePath = manifest.mobileWorldContentPaths[language];

  progressCallback({ status: ProgressStatus.Downloading });

  const sqliteDefinitions = await getDefinitionsFromSQLite(
    sqlitePath,
    progressCallback
  );

  const jsonTablesToFetch = Object.entries(
    manifest.jsonWorldComponentContentPaths[language]
  ).filter(([tableName]) => {
    return (
      !BANNED_TABLE_NAMES.includes(tableName) && !sqliteDefinitions[tableName]
    );
  });

  log("Loading JSON components for", jsonTablesToFetch);

  progressCallback({ status: ProgressStatus.LoadingJSONTables });

  const loadedJsonTables = await Promise.all(
    jsonTablesToFetch.map(async ([tableName, tablePath]) => {
      return fetch(`https://www.bungie.net${tablePath}`)
        .then((resp) => resp.json())
        .then((definitionsTable: DefinitionTable) => ({
          tableName,
          definitionsTable,
        }));
    })
  );

  const allDefinitions = { ...sqliteDefinitions };
  for (const jsonTable of loadedJsonTables) {
    allDefinitions[jsonTable.tableName] = jsonTable.definitionsTable;
  }

  dataCallback(null, { done: true, definitions: allDefinitions });

  const storedDefinitionsPayload: [string, StoredDefinition][] = Object.entries(
    allDefinitions
  )
    .map(([tableName, definitionsTable]) => {
      return {
        tableName,
        version,
        definitions: definitionsTable,
      };
    })
    .map((storedDef) => [keyForStoredDefinition(storedDef), storedDef]);

  await idbSetMany(storedDefinitionsPayload, idbStore);

  // TODO: should clear all keys
}

function keyForStoredDefinition(storedDef: StoredDefinition) {
  return storedDef.tableName + "|" + storedDef.version;
}

let sqliteLibPromise: Promise<any>;

async function getDefinitionsFromSQLite(
  sqlitePath: string,
  progressCallback: ProgressCallback
): Promise<Record<string, DefinitionTable>> {
  if (!sqliteLibPromise) {
    sqliteLibPromise = requireDatabase();
  }

  const [SQLLib, databaseBlob] = await Promise.all([
    sqliteLibPromise,
    fetchSQLiteDB(sqlitePath, progressCallback),
  ]);

  progressCallback({ status: ProgressStatus.ExtractingTables });

  log("Loaded both SQL library and definitions database");
  const db = await openDBFromBlob(SQLLib, databaseBlob);
  log("Opened database as SQLite DB object");

  const tablesToRequest: string[] = // TODO: rename to sqliteTableNames
    db
      .exec(`SELECT name FROM sqlite_master WHERE type='table';`)[0]
      .values.map((a: string[]) => a[0]);

  log("Extracting tables from definitions database", tablesToRequest);

  const sqliteDefinitions: Record<string, DefinitionTable> = {};

  for (const tableName of tablesToRequest) {
    const tableDefs = getAllRecords(db, tableName);
    if (tableDefs) {
      sqliteDefinitions[tableName] = tableDefs;
    }
  }

  return sqliteDefinitions;
}

async function fetchSQLiteDB(
  dbPath: string,
  progressCallback: ProgressCallback
) {
  const sqliteArchiveBlob = await requestSQLiteArchive(dbPath);

  log("Successfully downloaded definitions archive");
  progressCallback({ status: ProgressStatus.Unzipping });

  const sqliteBlob = await unzipManifest(sqliteArchiveBlob);
  log("Successfully unzipped definitions archive");

  return sqliteBlob;
}

async function requestSQLiteArchive(dbPath: string) {
  log("Requesting fresh definitions archive", { dbPath });

  const resp = await axios(`https://www.bungie.net${dbPath}`, {
    responseType: "blob",
    onDownloadProgress: (progressEvent) =>
      console.log("requestSQLiteArchive", progressEvent),
  });

  log("Finished downloading definitions archive");

  return resp.data;
}

function unzipManifest(blob: any) {
  log("Unzipping definitions archive");

  return new Promise((resolve, reject) => {
    zip.useWebWorkers = true;
    zip.workerScripts = { inflater: [zipWorker, inflate] };

    zip.createReader(
      new zip.BlobReader(blob),
      (zipReader: any) => {
        // get all entries from the zip
        zipReader.getEntries((entries: any) => {
          if (!entries.length) {
            log("Zip archive is empty. Something went wrong");
            const err = new Error("Definitions archive is empty");
            return reject(err);
          }

          log("Found", entries.length, "entries within definitions archive");
          log("Loading first file...", entries[0].filename);

          entries[0].getData(new zip.BlobWriter(), (blob: any) => {
            resolve(blob);
          });
        });
      },
      (error: any) => {
        reject(error);
      }
    );
  });
}

function openDBFromBlob(SQLLib: any, blob: any): Promise<any> {
  const url = window.URL.createObjectURL(blob);
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
      const uInt8Array = new Uint8Array(this.response);
      resolve(new SQLLib.Database(uInt8Array));
    };
    xhr.send();
  });
}
