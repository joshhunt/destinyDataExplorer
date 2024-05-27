import { IDBPDatabase, openDB } from "idb";

import { createDebug } from "./debug";
import {
  AnyDefinition,
  StoredDefinition,
  StoredDefinitionInput,
} from "./types";

const debug = createDebug("definitionsStore");

export class DefinitionsStore {
  dbVersion = 1;
  dbName = "data-explorer-ng";
  storeName = "definitions";

  ready: Promise<IDBPDatabase<unknown>>;

  constructor() {
    this.ready = openDB(this.dbName, this.dbVersion, {
      upgrade: this.upgradeHandler,
    });
  }

  upgradeHandler = (db: IDBPDatabase<unknown>) => {
    const objectStore = db.createObjectStore(this.storeName, {
      // The primary key must be compound, starting with version, so we can bulk delete based on version
      keyPath: ["version", "tableName", "key"],
    });

    objectStore.createIndex("tableName", "tableName");
    objectStore.createIndex("version", "version");
    objectStore.createIndex("byVersionByTable", ["version", "tableName"]);
    objectStore.createIndex("byVersionByKey", ["version", "key"]);
  };

  async addDefinitions(
    version: string,
    tableName: string,
    definitions: AnyDefinition[]
  ) {
    const tx = (await this.ready).transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);

    for (const def of definitions) {
      const storedDef: StoredDefinitionInput = {
        version: version,
        tableName,
        key: getKeyForDefinition(tableName, def),
        definition: def,
      };

      try {
        await store.put(storedDef);
      } catch (err) {
        console.error("Error storing definition", err, storedDef);
        throw err;
      }
    }

    await tx.done;
    debug("Stored", definitions.length, tableName, "definitions");
  }

  async getDefinition(tableName: string, hash: number) {
    const def = (await this.ready).get(this.storeName, [tableName, hash]);
    return def;
  }

  getByKeyCache = new Map<number, StoredDefinition>();

  async getByKey(key: number): Promise<StoredDefinition | undefined> {
    let value = this.getByKeyCache.get(key);

    if (value) {
      return Promise.resolve(value);
    }

    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    value = await store.get(key);
    if (value) {
      this.getByKeyCache.set(key, value);
    }

    return value;
  }

  async countForTable(version: string, tableName: string) {
    const db = await this.ready;
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const storeIndex = store.index("byVersionByTable");
    return storeIndex.count([version, tableName]);
  }

  async getAllKeys() {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);

    const allKeys = await store.getAllKeys();

    return allKeys;
  }

  async getAllKeysForTable(version: string, tableName: string) {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const tableNameIndex = store.index("byVersionByTable");

    const allKeys = await tableNameIndex.getAllKeys([version, tableName]);

    return allKeys;
  }

  async getAllRowsForTable(tableName: string) {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const tableNameIndex = store.index("tableName");

    const allKeys = await tableNameIndex.getAll(tableName);

    return allKeys;
  }

  /** Deletes all stored definitions not matching the requested version */
  async cleanupForVersion(versionToKeep: string) {
    const tx = (await this.ready).transaction(this.storeName, "readwrite", {
      durability: "strict",
    });

    const store = tx.objectStore(this.storeName);
    const versionIndex = store.index("version");

    // Get all unique versions
    console.time("get unique versions");
    let cursor = await versionIndex.openKeyCursor(undefined, "nextunique");
    const versions: string[] = [];
    while (cursor) {
      const version = cursor.key;
      if (typeof version !== "string") {
        throw new Error("Version was not a string");
      }

      if (version !== versionToKeep) {
        versions.push(version);
      }

      cursor = await cursor.continue();
    }
    console.timeEnd("get unique versions");
    debug("Unique versions to delete", versions);

    for (const version of versions) {
      console.time(`deleting ${version}`);

      // See https://stackoverflow.com/a/55983636
      // The primary key is a composit key of [version, tableName, key] which allows us to delete all rows
      // for a version in a single operation
      // The key range goes until version + xxxxxx, hoping that all table names are sorted before 'xxxxxx'
      const keyRange = IDBKeyRange.bound(
        [version, 0],
        [version, "xxxxxx"],
        false,
        true
      );
      await store.delete(keyRange);

      console.timeEnd(`deleting ${version}`);
    }
  }

  async getAllDefinitions(version: string) {
    const allDefinitions: StoredDefinition[] = [];

    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const versionKeyIndex = store.index("version");

    let cursor = await versionKeyIndex.openCursor(version);

    while (cursor) {
      allDefinitions.push(cursor.value);
      cursor = await cursor.continue();
    }

    return allDefinitions;
  }
}

export const store = new DefinitionsStore();

/**
 * @deprecated Not used
 */
export function getKeyRanges(keys: IDBValidKey[]) {
  const sparse = [];

  for (var i = 0; i < keys.length; i++) {
    const value = keys[i];
    if (typeof value !== "number") {
      throw new Error("Number was not passed into getKeyRanges");
    }

    sparse[value] = true;
  }

  const ranges: [number?, number?][] = [[]];
  let currentRange: (typeof ranges)[number] | undefined;

  for (let index = 0; index < sparse.length; index++) {
    currentRange = ranges.at(-1);

    if (!currentRange) {
      throw new Error("do not have a currentRange");
    }

    const prevHasValue = sparse[index - 1];
    const hasValue = sparse[index];

    if (!prevHasValue && hasValue) {
      // is start of a range
      currentRange[0] = index;
    } else if (hasValue) {
      // is middle of a range
    } else if (prevHasValue && !hasValue) {
      // prev i is end of range
      currentRange[1] = index - 1;
      ranges.push([]);
    } else {
      // is just not in a range
    }
  }

  if (currentRange?.length === 1) {
    currentRange.push(sparse.length - 1);
  }

  return ranges;
}

function getKeyForDefinition(tableName: string, def: AnyDefinition) {
  if (def.hash == undefined) {
    throw new Error(`Definition ${tableName} does not have a hash`);
  }

  return def.hash;
}
