import {
  AllDestinyManifestComponents,
  DestinyInventoryItemDefinition,
} from "bungie-api-ts/destiny2";
import Item from "components/Item";
import { useDefinitionTable } from "lib/destinyTsUtils";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import React, { useMemo } from "react";

import s from "../styles.module.scss";

interface PerkDetailsProps {
  definition: DestinyInventoryItemDefinition;
}

const PerkDetails: React.FC<PerkDetailsProps> = ({ definition }) => {
  const perkItemHash = definition.hash;
  const pathForItem = usePathForDefinition();

  const itemDefs =
    (useDefinitionTable(
      "DestinyInventoryItemDefinition"
    ) as AllDestinyManifestComponents["DestinyInventoryItemDefinition"]) ||
    undefined;
  const plugSetDefs =
    (useDefinitionTable(
      "DestinyPlugSetDefinition"
    ) as AllDestinyManifestComponents["DestinyPlugSetDefinition"]) || undefined;

  const itemsWithThisPerk = useMemo(() => {
    if (!itemDefs || !plugSetDefs) {
      return null;
    }

    const matchingPlugSets = Object.values(plugSetDefs).filter((plugSet) =>
      plugSet.reusablePlugItems.some((v) => v.plugItemHash === perkItemHash)
    );

    return Object.values(itemDefs).filter((itemDef) => {
      return itemDef.sockets?.socketEntries.some((socket) => {
        return (
          socket.singleInitialItemHash === perkItemHash ||
          socket.reusablePlugItems.some(
            (v) => v.plugItemHash === perkItemHash
          ) ||
          matchingPlugSets.some((v) => socket.randomizedPlugSetHash === v.hash)
        );
      });
    });
  }, [itemDefs, perkItemHash, plugSetDefs]);

  console.log({ itemsWithThisPerk });

  if (!itemsWithThisPerk || itemsWithThisPerk.length < 1) {
    return null;
  }

  return (
    <div>
      <h3>Items with this perk</h3>
      <div className={s.itemGrid}>
        {itemsWithThisPerk?.map((item) => (
          <Item
            pathForItem={pathForItem}
            className={s.item}
            key={item.hash}
            isCollected={false}
            onClick={() => {}}
            entry={{
              type: "DestinyInventoryItemDefinition",
              def: item,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PerkDetails;
