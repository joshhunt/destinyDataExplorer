import { useEffect, useRef, useState } from "react";

import "./App.css";
import { ItemGrid } from "./components/ItemGrid";
import { LoadingTables } from "./components/LoadingTables";
import { workerInterface } from "./defsWorker/interface";
import { store } from "./lib/DefinitionsStore";
import {
  InitDefinitionsProgressEvent,
  PrimaryKey,
  ProgressRecord,
} from "./lib/types";

function App() {
  const [defsKeys, setKeys] = useState<PrimaryKey[]>([]);
  const [loadingState, setLoadingState] = useState<ProgressRecord>({});
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    function onProgress(prog: InitDefinitionsProgressEvent) {
      if (prog.type === "version-known") {
        loadKeys(prog.version);
      }

      if (prog.type === "table-progress") {
        setLoadingState(prog.progress);
      }
    }

    let version: string | null;

    const search = new URLSearchParams(window.location.search);
    const pretendVersion = search.get("pretend") ?? undefined;

    workerInterface
      .post({ type: "init", pretendVersion }, onProgress)
      .then((rawResp) => {
        const resp = rawResp as { version: string };
        version = resp.version;
        return loadKeys(resp.version);
      })
      .then(() => {
        if (!version) {
          throw new Error("missing version");
        }

        // return workerInterface.post({ type: "init-search-fuse", version });
      })
      .catch(console.error);

    function loadKeys(version: string) {
      const promises = Promise.all([
        store.getAllKeysForTable(version, "DestinyInventoryItemDefinition"),
      ]);

      return promises
        .then((allKeys) => {
          const allAllKeys = allKeys
            .flatMap((v) => v)
            .sort((a, b) => (a as number) - (b as number));

          setKeys(allAllKeys as PrimaryKey[]);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  const isLoading = Object.values(loadingState).some((row) => !row[1]);

  if (isLoading) {
    return <LoadingTables loadingState={loadingState} />;
  }

  // return <Debug />;

  return (
    <>
      <h1>Items</h1>
      <p>
        <a href="/?pretend=123456.11.22.33.44-pretend">pretend</a>
      </p>
      <ItemGrid defsKeys={defsKeys} />
    </>
  );
}

export default App;
