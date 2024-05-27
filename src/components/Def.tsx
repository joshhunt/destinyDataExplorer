import { useMemo, useState, useEffect } from "react";

import { store } from "../lib/DefinitionsStore";
import { AnyDefinition, PrimaryKey, StoredDefinition } from "../lib/types";

interface DefProps {
  pkey: PrimaryKey;
}

export function Def({ pkey }: DefProps) {
  const [row, loaded] = useDefinition(pkey);

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

function useDefinition(pkey: PrimaryKey) {
  const [def, setDef] = useState<UseDefTuple>([undefined, false]);

  useEffect(() => {
    async function run() {
      try {
        const defResult = await store.getByKey(pkey);
        setDef([defResult, true]);
      } catch {
        setDef([undefined, true]);
      }
    }

    run();
  }, [pkey]);

  return def;
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
