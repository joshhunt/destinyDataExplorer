import React from "react";
import InventoryItemDetails, {
  displayInventoryItemDetails,
} from "./types/InventoryItemDetails";

interface DefinitionDetailsProps {
  definition: any;
  tableName: string;
}

const DefinitionDetails: React.FC<DefinitionDetailsProps> = ({
  definition,
  tableName,
}) => {
  if (tableName === "DestinyInventoryItemDefinition") {
    return <InventoryItemDetails definition={definition} />;
  }

  return <div>DefinitionDetails</div>;
};

export function displayDefinitionDetails(tableName: string, definition: any) {
  return displayInventoryItemDetails(tableName, definition);
}

export default DefinitionDetails;
