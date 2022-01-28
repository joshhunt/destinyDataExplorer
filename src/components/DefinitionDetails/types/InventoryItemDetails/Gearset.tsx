import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Item from "components/Item";
import { Subtitle1 } from "components/Text";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import { notEmpty } from "lib/utils";
import React from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "types";

import s from "../styles.module.scss";

interface ItemGearsetProps {
  definition: DestinyInventoryItemDefinition;
}

const ItemGearset: React.FC<ItemGearsetProps> = ({ definition }) => {
  const pathForItem = usePathForDefinition();

  const items = useSelector((state: ReduxState) =>
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
      <Subtitle1>Gearset</Subtitle1>

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
