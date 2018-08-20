import Dexie from 'dexie';
import axios from 'axios';

import 'imports-loader?this=>window!@destiny-item-manager/zip.js'; // eslint-disable-line
import inflate from 'file-loader!@destiny-item-manager/zip.js/WebContent/inflate.js'; // eslint-disable-line
import zipWorker from 'file-loader!@destiny-item-manager/zip.js/WebContent/z-worker.js'; // eslint-disable-line

import { requireDatabase, getAllRecords } from './database';
import { getDestiny } from './destiny';

const db = new Dexie('destinyManifest');
db.version(1).stores({
  manifestBlob: '&key, data',
  allData: '&key, data'
});

function fetchManifestDBPath() {
  return getDestiny('/platform/Destiny2/Manifest/').then(data => {
    const englishUrl = data.mobileWorldContentPaths.en;
    return englishUrl;
  });
}

function fetchManifest(dbPath) {
  console.log('Requesting manifest from', dbPath);

  return db.manifestBlob.get(dbPath).then(cachedValue => {
    if (cachedValue) {
      return cachedValue.data;
    }

    return axios(`https://www.bungie.net${dbPath}`, {
      responseType: 'blob',
      onDownloadProgress(progress) {
        console.log(
          `Progress ${Math.round(progress.loaded / progress.total * 100)}%`
        );
      }
    }).then(resp => {
      console.log('Finished loading manifest');
      console.log('Storing in db', { key: dbPath, data: resp.data });
      db.manifestBlob.put({ key: dbPath, data: resp.data });
      return resp.data;
    });
  });
}

function unzipManifest(blob) {
  console.log('Unzipping file...');
  return new Promise((resolve, reject) => {
    zip.useWebWorkers = true; // eslint-disable-line  no-undef

    // eslint-disable-next-line no-undef
    zip.workerScripts = {
      inflater: [zipWorker, inflate]
    };

    // eslint-disable-next-line no-undef
    zip.createReader(
      new zip.BlobReader(blob), // eslint-disable-line
      zipReader => {
        // get all entries from the zip
        zipReader.getEntries(entries => {
          if (entries.length) {
            console.log('Found', entries.length, 'entries within zip file');
            console.log('Loading first file...', entries[0].filename);

            // eslint-disable-next-line no-undef
            entries[0].getData(new zip.BlobWriter(), blob => {
              resolve(blob);
            });
          }
        });
      },
      error => {
        reject(error);
      }
    );
  });
}

function loadManifest(dbPath) {
  return fetchManifest(dbPath)
    .then(data => {
      console.log('Got a blob db', data);
      return unzipManifest(data);
    })
    .then(manifestBlob => {
      console.log('Got unziped db', manifestBlob);
      return manifestBlob;
    });
}

function openDBFromBlob(SQLLib, blob) {
  const url = window.URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      const uInt8Array = new Uint8Array(this.response);
      resolve(new SQLLib.Database(uInt8Array));
    };
    xhr.send();
  });
}

function allDataFromRemote(dbPath) {
  return Promise.all([requireDatabase(), loadManifest(dbPath)])
    .then(([SQLLib, manifestBlob]) => {
      console.log('Loaded both SQL library and manifest blob');
      return openDBFromBlob(SQLLib, manifestBlob);
    })
    .then(db => {
      console.log('Got proper SQLite DB', db);

      const allTables = db
        .exec(`SELECT name FROM sqlite_master WHERE type='table';`)[0]
        .values.map(a => a[0]);

      console.log('All tables', allTables);

      const allData = allTables.reduce((acc, tableName) => {
        console.log('Getting all records for', tableName);
        const records = getAllRecords(db, tableName);

        if (records) {
          acc[tableName] = records;
        }

        return acc;
      }, {});

      return allData;
    });
}

export function getAllDefinitions(progressCb) {
  return fetchManifestDBPath()
    .then(dbPath => {
      return Promise.all([db.allData.get(dbPath), Promise.resolve(dbPath)]);
    })
    .then(([cachedData, dbPath]) => {
      if (cachedData) {
        return cachedData.data;
      }

      progressCb({ updating: true });

      return allDataFromRemote(dbPath).then(allData => {
        db.allData.put({ key: dbPath, data: allData });

        return allData;
      });
    });
}
