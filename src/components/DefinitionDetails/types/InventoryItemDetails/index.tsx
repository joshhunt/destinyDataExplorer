import React from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";

import Sockets from "./Sockets";
import Objectives from "./Objectives";
import ItemGearset from "./Gearset";
import PerkDetails from "./PerkDetails";
import Crafting from "./Crafting";
import Quest from "./Quest";

interface InventoryItemDetailsProps {
  definition: DestinyInventoryItemDefinition;
}

const InventoryItemDetails: React.FC<InventoryItemDetailsProps> = ({
  definition,
}) => {
  return (
    <div>
      <Sockets definition={definition} />
      <ItemGearset definition={definition} />
      <PerkDetails definition={definition} />
      <Crafting definition={definition} />

      {definition.setData ? (
        <Quest definition={definition} />
      ) : (
        <Objectives definition={definition} />
      )}
    </div>
  );
};

export default InventoryItemDetails;

export function displayInventoryItemDetails(
  tableName: string,
  definition: any
) {
  return (
    (tableName === "DestinyInventoryItemDefinition" &&
      (definition.sockets || definition.objectives)) ||
    definition.gearset ||
    definition.plug ||
    definition.crafting?.outputItemHash ||
    definition.setData?.itemList?.length
  );
}
