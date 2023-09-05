import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import { store } from "./lib/DefinitionsStore";
import useResizeObserver from "@react-hook/resize-observer";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { AnyDefinition, type StoredDefinition } from "./lib/types";
import pLimit from "p-limit";
import { getDestinyManifest } from "bungie-api-ts/destiny2";
import { httpClient } from "./lib/httpClient";

function App() {
  const [columnCount, setColumnCount] = useState(8);
  const [defsKeys, setKeys] = useState<number[]>([]);
  const [loadingState, setLoadingState] = useState<number>(0);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    function loadKeys() {
      store
        .getAllKeysForTable("DestinyInventoryItemDefinition")
        .then((allKeys) => {
          setKeys(allKeys as number[]);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    loadKeys();
    loadDefs((prog) => {
      setLoadingState(prog);
    }).finally(() => {
      loadKeys();
    });
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);

  const gridRef = useRef(null);
  useResizeObserver(gridRef, (entry) => {
    const gridComputedStyle = window.getComputedStyle(entry.target);
    const gridColumnCount = gridComputedStyle
      .getPropertyValue("grid-template-columns")
      .split(" ").length;

    setColumnCount(gridColumnCount);
  });

  const parentOffsetRef = useRef(0);

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const itemsPerRow = columnCount;
  const itemCount = defsKeys?.length ?? 0;
  const rowCount = Math.ceil(itemCount / itemsPerRow);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 68,
    overscan: 0,
    scrollMargin: parentOffsetRef.current,
  });
  const virtualRows = virtualizer.getVirtualItems();

  const measureElement = useCallback(
    (el: HTMLElement | null) => {
      virtualizer.measureElement(el);
    },
    [virtualizer.measureElement]
  );

  return (
    <>
      {defsKeys.length > 0 ? (
        <h1>Items</h1>
      ) : (
        <h1>Loading {Math.floor(loadingState * 100)}%</h1>
      )}

      <div ref={parentRef} className="List">
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <div
            className="Grid"
            ref={gridRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${
                (virtualRows[0]?.start ?? 0) - virtualizer.options.scrollMargin
              }px)`,
            }}
          >
            {virtualRows.flatMap((virtualRow) => {
              const virtualKeys = new Array(itemsPerRow)
                .fill(0)
                .map(
                  (_, index) => defsKeys[virtualRow.index * itemsPerRow + index]
                );

              return virtualKeys.map((key, index) => {
                if (!key) return;

                return (
                  <div
                    key={key}
                    data-index={virtualRow.index}
                    ref={index === 0 ? measureElement : undefined}
                    className={
                      virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
                    }
                  >
                    <div style={{ padding: "10px 0" }}>
                      <Def defKey={key} />
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

interface DefProps {
  defKey: number;
}

function getName(def: AnyDefinition) {
  if ("displayProperties" in def) {
    return def.displayProperties.name;
  }
}

function getIcon(def: AnyDefinition) {
  if ("displayProperties" in def) {
    return def.displayProperties.icon;
  }
}

function getTierTypeClass(def: AnyDefinition) {
  if (!("inventory" in def)) {
    return "";
  }

  switch (def.inventory?.tierType) {
    case 4:
      return "item-tier-blue";

    case 5:
      return "item-tier-legendary";
  }
}

function Def(props: DefProps) {
  const [sd, loaded] = useDefinition(props.defKey);

  const prettyTableName = useMemo(
    () => sd?.tableName?.match(/Destiny(\w+)Definition/)?.[1] ?? "",
    [sd]
  );

  if (!loaded) {
    return <div className="item-loading">Loading...</div>;
  }

  if (!sd) {
    return <div className="item-loading">Error</div>;
  }

  const def = sd.definition as AnyDefinition;
  const name = getName(def);
  const icon = getIcon(def);

  return (
    <div className="item">
      <div className="item_icon">
        <img
          className={getTierTypeClass(def)}
          src={`https://www.bungie.net${icon}`}
        />
      </div>

      <div className="item_main">
        <div className="item_name">{name}</div>
        <div className="item_type">
          {prettyTableName} {def.index}
        </div>
      </div>
    </div>
  );
}

type UseDefTuple = [StoredDefinition, true] | [undefined, boolean];

function useDefinition(key: number) {
  const [def, setDef] = useState<UseDefTuple>([undefined, false]);

  useEffect(() => {
    if (key === -1) return;

    async function run() {
      try {
        const defResult = await store.getByKey(key);
        setDef([defResult, true]);
      } catch {
        setDef([undefined, true]);
      }
    }

    run();
  }, [key]);

  return def;
}

const BANNED_TABLES = [
  "DestinyInventoryItemLiteDefinition",
  "DestinyRewardSourceDefinition",
  "DestinyMetricDefinition",
];

const limit = pLimit(8);

async function loadDefs(cb: (progress: number) => void) {
  console.log("Loading definitions");
  const manifest = await getDestinyManifest(httpClient);

  const version = manifest.Response.version;

  const components = Object.entries(
    manifest.Response.jsonWorldComponentContentPaths.en
  ).filter(([tableName]) => !BANNED_TABLES.includes(tableName));

  let loaded = 0;

  const promises = components.map(async ([tableName, defsPath]) => {
    await limit(async () => {
      await loadTable(version, tableName, defsPath);
      loaded += 1;
      cb(loaded / components.length);
    });
  });

  await Promise.all(promises);
  window.localStorage.setItem("defs-ng-loaded", "true");
}

async function loadTable(version: string, tableName: string, defsPath: string) {
  const defsCount = (await store.countForTable(version, tableName)) ?? -1;

  if (defsCount > 0) {
    return;
  }

  const req = await fetch(`https://www.bungie.net${defsPath}`);
  const defs = await req.json();
  await store.addDefinitions(version, tableName, Object.values(defs));
}
