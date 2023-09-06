import useResizeObserver from "@react-hook/resize-observer";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";
import { workerInterface } from "./defsWorker/interface";
import { store } from "./lib/DefinitionsStore";
import {
  AnyDefinition,
  ProgressRecord,
  type StoredDefinition,
} from "./lib/types";

function App() {
  const [columnCount, setColumnCount] = useState(8);
  const [defsKeys, setKeys] = useState<number[]>([]);
  const [loadingState, setLoadingState] = useState<ProgressRecord>({});
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    function onProgress(prog: any) {
      setLoadingState(prog);
    }

    workerInterface
      .post({ type: "init" }, onProgress)
      .then((resp) => {
        console.log("init defs", resp);
        loadKeys();
      })
      .catch(console.error);

    function loadKeys() {
      const promises = Promise.all([
        store.getAllKeysForTable("DestinyInventoryItemDefinition"),
      ]);

      promises
        .then((allKeys) => {
          const allAllKeys = allKeys
            .flatMap((v) => v)
            .sort((a, b) => (a as number) - (b as number));
          setKeys(allAllKeys as number[]);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    // loadKeys();

    // loadDefs((prog) => {
    //   setLoadingState(prog);
    // }).finally(() => {
    //   loadKeys();
    // });
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

  const [loadingTables, finishedTables] = useMemo(() => {
    const progress = Object.entries(loadingState).reverse();
    const loadingTables: [string, number][] = [];
    const finishedTables: [string, number][] = [];

    for (const [tableName, [bytes, isFinished]] of progress) {
      const foo: [string, number] = [tableName, bytes];
      if (isFinished) {
        finishedTables.push(foo);
      } else {
        loadingTables.push(foo);
      }
    }

    return [loadingTables, finishedTables];
  }, [loadingState]);

  return (
    <>
      {loadingTables.length > 0 ? (
        <>
          {loadingTables.map(([tableName, bytes]) => {
            return (
              <pre key={tableName}>
                {tableName}
                {new Array(Math.ceil(bytes / 1024 / 1024 / 2))
                  .fill(".")
                  .join("")}
              </pre>
            );
          })}
          {finishedTables.map(([tableName]) => {
            return (
              <pre key={tableName} className="finished-table">
                {tableName}
                {" ✔️"}
              </pre>
            );
          })}
        </>
      ) : (
        <h1>Items</h1>
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
  const [row, loaded] = useDefinition(props.defKey);

  const prettyTableName = useMemo(
    () => row?.tableName?.match(/Destiny(\w+)Definition/)?.[1] ?? "",
    [row]
  );

  if (!loaded) {
    return <div className="item-loading">Loading...</div>;
  }

  if (!row) {
    return <div className="item-loading">Error</div>;
  }

  const def = row.definition as AnyDefinition;
  const name = getName(def);
  const icon = getIcon(def);

  return (
    <div className="item">
      <div className="item_icon">
        {icon && (
          <img
            className={getTierTypeClass(def)}
            src={`https://www.bungie.net${icon}`}
          />
        )}
      </div>

      <div className="item_main">
        <div className="item_name">{name}</div>
        <div className="item_type">
          {prettyTableName} {def.hash}
          {/* {row.version} */}
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
