import { IDBPDatabase, openDB, unwrap } from "idb";

import {
  AnyDefinition,
  StoredDefinition,
  StoredDefinitionInput,
} from "./types";

// Old Version
// 118365.23.08.23.1700-1-bnet.51829

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
      keyPath: "key",
      autoIncrement: true,
    });

    objectStore.createIndex("tableName", "tableName");
    objectStore.createIndex("version", "version");
    objectStore.createIndex("byVersionByTable", ["version", "tableName"]);
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
        version,
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
    const tx = (await this.ready).transaction(this.storeName, "readonly");
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

  async deleteAllNotVersion(versionToKeep: string) {
    const tx = (await this.ready).transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const tableNameIndex = unwrap(store.index("version"));

    const toDelete: IDBValidKey = [];

    let keyCounter = 0;

    console.log("iterating over all keys...");
    const keyCursorRequest = tableNameIndex.openKeyCursor();
    keyCursorRequest.onsuccess = (evt) => {
      const cursor = evt.target.result;
      if (cursor) {
        keyCounter += 1;
        cursor.continue();
      } else {
        console.log("read all keys", keyCounter);
      }
    };

    // let keyCursor = await tableNameIndex.openKeyCursor();

    // console.log("iterating over all keys...");
    // while (keyCursor) {
    //   // console.log(keyCursor.key, keyCursor.primaryKey);
    //   keyCursor = await keyCursor.continue();
    // }
    // console.log("...done");
  }
}

export const store = new DefinitionsStore();
