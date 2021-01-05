import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Item from "components/Item";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import { notEmpty } from "lib/utils";
import React from "react";
import { useSelector } from "react-redux";
import { ReduxStore } from "types";

import s from "../styles.module.scss";

interface ItemGearsetProps {
  definition: DestinyInventoryItemDefinition;
}

const ItemGearset: React.FC<ItemGearsetProps> = ({ definition }) => {
  const pathForItem = usePathForDefinition();

  const items = useSelector((state: ReduxStore) =>
    definition.gearset?.itemList
      .map(
        (itemHash) =>
          state.definitions.definitions?.DestinyInventoryItemDefinition?.[
            itemHash
          ]
      )
      .filter(notEmpty)
  );

  if (!items) {
    return null;
  }

  return (
    <div>
      <h3 className={s.category}>Gearset</h3>

      <div className={s.categoryItems}>
        {items.map((item) => (
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

export default ItemGearset;
