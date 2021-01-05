import React from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";

import Sockets from "./Sockets";
import Objectives from "./Objectives";
import ItemGearset from "./Gearset";

interface InventoryItemDetailsProps {
  definition: DestinyInventoryItemDefinition;
}

const InventoryItemDetails: React.FC<InventoryItemDetailsProps> = ({
  definition,
}) => {
  return (
    <div>
      <Objectives definition={definition} />
      <Sockets definition={definition} />
      <ItemGearset definition={definition} />
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
    definition.gearset
  );
}
