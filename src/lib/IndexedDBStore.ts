function promisifyRequest<T>(
  request: IDBRequest<T> | IDBTransaction
): Promise<T>;
function promisifyRequest(request: IDBTransaction): Promise<void>;
function promisifyRequest<T>(
  request: IDBRequest<T> | IDBTransaction
): Promise<T | void> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);

    if (request instanceof IDBTransaction) {
      request.oncomplete = () => resolve();
      request.onabort = () => reject(request.error);
    } else {
      request.onsuccess = () => resolve(request.result);
    }
  });
}

function collectCursorValues(
  cursorRequest: IDBRequest<IDBCursorWithValue | null>
): Promise<any[]> {
  const results: any[] = [];

  return new Promise((resolve, reject) => {
    cursorRequest.onerror = (err) => {
      reject(err);
    };

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;

      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
}

function isFirefox() {
  return /Gecko\/\d/.test(navigator.userAgent);
}

export default class IndexedDBStore {
  private _storeName: string;
  private _dbPromise: Promise<IDBDatabase>;

  constructor(databaseName: string, storeName: string) {
    this._storeName = storeName;

    const dbOpenRequest = indexedDB.open(databaseName);

    dbOpenRequest.onupgradeneeded = () =>
      dbOpenRequest.result.createObjectStore(storeName);

    this._dbPromise = promisifyRequest(dbOpenRequest);
  }

  private async _getAllWithCursor() {
    const db = await this._dbPromise;

    const cursorRequest = db
      .transaction(this._storeName, "readonly")
      .objectStore(this._storeName)
      .openCursor();

    const results = await collectCursorValues(cursorRequest);

    return results;
  }

  private async _getAllWithGetAll() {
    const db = await this._dbPromise;

    const request = db
      .transaction(this._storeName, "readonly")
      .objectStore(this._storeName)
      .getAll();

    return promisifyRequest(request);
  }

  private async _getAllWithGetAllWithFallback() {
    try {
      return this._getAllWithGetAll();
    } catch (err) {
      console.log("Error with .getAll() - falling back to openCursor()", err);
      return this._getAllWithCursor();
    }
  }

  async getAll() {
    if (isFirefox()) {
      return this._getAllWithCursor();
    }

    return this._getAllWithGetAllWithFallback();
  }

  async keys() {
    const db = await this._dbPromise;

    const request = db
      .transaction(this._storeName, "readonly")
      .objectStore(this._storeName)
      .getAllKeys();

    return promisifyRequest(request);
  }

  async putMany(entries: [IDBValidKey, unknown][]) {
    const db = await this._dbPromise;

    const store = db
      .transaction(this._storeName, "readwrite")
      .objectStore(this._storeName);

    for (const [key, value] of entries) {
      store.put(value, key);
    }

    return promisifyRequest(store.transaction);
  }

  async deleteMany(keys: IDBValidKey[]) {
    const db = await this._dbPromise;

    const store = db
      .transaction(this._storeName, "readwrite")
      .objectStore(this._storeName);

    for (const key of keys) {
      store.delete(key);
    }

    return promisifyRequest(store.transaction);
  }
}
