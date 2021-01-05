import React from "react";
import InventoryItemDetails, {
  displayInventoryItemDetails,
} from "./types/InventoryItemDetails";
import VendorDetails, { displayVendorDetails } from "./types/VendorDetails";

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

  if (tableName === "DestinyVendorDefinition") {
    return <VendorDetails definition={definition} />;
  }

  return null;
};

export function displayDefinitionDetails(tableName: string, definition: any) {
  return (
    displayInventoryItemDetails(tableName, definition) ||
    displayVendorDetails(tableName)
  );
}

export default DefinitionDetails;
