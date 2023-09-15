import { IDBPDatabase, openDB } from "idb";

import {
  AnyDefinition,
  StoredDefinition,
  StoredDefinitionInput,
} from "./types";

export class DefinitionsStore {
  dbVersion = 1;
  dbName = "data-explorer-ng";
  storeName = "definitions";

  ready: Promise<IDBPDatabase<unknown>>;

  constructor() {
    this.ready = openDB(this.dbName, this.dbVersion, {
      upgrade: this.upgradeHandler,
      blocked: (...args: any[]) => console.log("table blocked", ...args),
      blocking: (...args: any[]) => console.log("table blocking", ...args),
      terminated: (...args: any[]) => console.log("table terminated", ...args),
    });

    // this.ready = Promise.reject("not opening idb connections");
  }

  upgradeHandler = (db: IDBPDatabase<unknown>) => {
    console.log("upgrade handler ");
    const objectStore = db.createObjectStore(this.storeName, {
      keyPath: "key",
      autoIncrement: true,
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
        tableName,
        definition: def,
        version: version,
      };

      try {
        await store.put(storedDef);
      } catch (err) {
        console.error("Error storing definition", err, storedDef);
        throw err;
      }
    }

    await tx.done;
    console.log("Stored", definitions.length, tableName, "definitions");
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
    console.log("countForTable");
    const db = await this.ready;
    console.log("got db");
    const tx = db.transaction(this.storeName, "readonly");
    console.log("got transaction");
    const store = tx.objectStore(this.storeName);
    console.log("got store");
    const storeIndex = store.index("byVersionByTable");
    console.log("got index");
    return storeIndex.count([version, tableName]);
  }

  async getAllKeys() {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);

    const allKeys = await store.getAllKeys();

    return allKeys;
  }

  async getAllKeysForTable(tableName: string) {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const tableNameIndex = store.index("tableName");

    const allKeys = await tableNameIndex.getAllKeys(tableName);

    return allKeys;
  }

  async getAllRowsForTable(tableName: string) {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const tableNameIndex = store.index("tableName");

    const allKeys = await tableNameIndex.getAll(tableName);

    return allKeys;
  }

  // async deleteAllNotVersion(versionToKeep: string) {
  //   const tx = (await this.ready).transaction(this.storeName, "readonly");
  //   const store = tx.objectStore(this.storeName);
  //   const tableNameIndex = unwrap(store.index("version"));

  //   const toDelete: IDBValidKey = [];

  //   let keyCounter = 0;

  //   console.log("iterating over all keys...");
  //   const keyCursorRequest = tableNameIndex.openKeyCursor();
  //   keyCursorRequest.onsuccess = (evt) => {
  //     const cursor = evt.target.result;
  //     if (cursor) {
  //       keyCounter += 1;
  //       cursor.continue();
  //     } else {
  //       console.log("read all keys", keyCounter);
  //     }
  //   };

  //   // let keyCursor = await tableNameIndex.openKeyCursor();

  //   // console.log("iterating over all keys...");
  //   // while (keyCursor) {
  //   //   // console.log(keyCursor.key, keyCursor.primaryKey);
  //   //   keyCursor = await keyCursor.continue();
  //   // }
  //   // console.log("...done");
  // }

  /** Deletes all stored definitions not matching the requested version */
  async cleanupForVersion(versionToKeep: string) {
    const tx = (await this.ready).transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const versionKeyIndex = store.index("version");

    const keysToDelete = await versionKeyIndex.getAllKeys(
      IDBKeyRange.upperBound(versionToKeep, true)
    );

    console.log("Deleting", keysToDelete.length, "old rows");

    let counter = 0;
    const intervalId = setInterval(() => {
      console.log(
        `deleted ${counter} / ${keysToDelete.length} ${Math.floor(
          (counter / keysToDelete.length) * 100
        )}%`
      );
    }, 500);

    for (const key of keysToDelete) {
      await store.delete(key);
      counter += 1;
    }

    clearInterval(intervalId);
  }
}

export const store = new DefinitionsStore();

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
