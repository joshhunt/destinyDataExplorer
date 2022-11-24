import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Item from "components/Item";
import { Subtitle1 } from "components/Text";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import React from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "types";

import s from "../styles.module.scss";

interface ItemCraftingProps {
  definition: DestinyInventoryItemDefinition;
}

const ItemCrafting: React.FC<ItemCraftingProps> = ({ definition }) => {
  const pathForItem = usePathForDefinition();

  const outputItem = useSelector(
    (state: ReduxState) =>
      state.definitions.definitions?.DestinyInventoryItemDefinition?.[
        definition.crafting.outputItemHash
      ]
  );

  if (!outputItem) {
    return null;
  }

  return (
    <div>
      <Subtitle1>Crafting</Subtitle1>

      <p>Output item:</p>

      <div className={s.categoryItems}>
        <Item
          pathForItem={pathForItem}
          className={s.item}
          isCollected={false}
          onClick={() => {}}
          entry={{
            type: "DestinyInventoryItemDefinition",
            def: outputItem,
          }}
        />
      </div>
    </div>
  );
};

export default ItemCrafting;
