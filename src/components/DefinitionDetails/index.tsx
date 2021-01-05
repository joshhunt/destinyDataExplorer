import React from "react";
import InventoryItemDetails, {
  displayInventoryItemDetails,
} from "./types/InventoryItemDetails";
import VendorDetails, { displayVendorDetails } from "./types/VendorDetails";
import RecordDetails, { displayRecordDetails } from "./types/RecordDetails";

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

  if (tableName === "DestinyRecordDefinition") {
    return <RecordDetails definition={definition} />;
  }

  return null;
};

export function displayDefinitionDetails(tableName: string, definition: any) {
  return (
    displayInventoryItemDetails(tableName, definition) ||
    displayVendorDetails(tableName) ||
    displayRecordDetails(tableName, definition)
  );
}

export default DefinitionDetails;
