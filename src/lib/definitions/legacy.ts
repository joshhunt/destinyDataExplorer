const log = require("lib/log")("definitions:migrations");

function deleteIndexedDBDatabase(dbName: string) {
  return new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName);

    req.onsuccess = () => {
      log("Successfully deleted indexedDB database", { dbName });
      resolve();
    };

    req.onerror = (event) => {
      const error = (event as any)?.target?.error;
      log("Error deleting indexedDB database", error, { dbName });
      reject(error);
    };

    req.onblocked = () => {
      log("onBlocked triggered while trying to delete indexedDB database", {
        dbName,
      });
    };
  });
}

export function cleanOldDatabases() {
  try {
    deleteIndexedDBDatabase("destinyManifest");
  } catch {}

  try {
    deleteIndexedDBDatabase("destidestinyDefinitionsnyManifest");
  } catch {}
}
