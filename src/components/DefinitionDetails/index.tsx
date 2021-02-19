import React from "react";
import InventoryItemDetails, {
  displayInventoryItemDetails,
} from "./types/InventoryItemDetails";
import RecordDetails, { displayRecordDetails } from "./types/RecordDetails";
import VendorDetails, { displayVendorDetails } from "./types/VendorDetails";
import PresentationNodeDetails, {
  displayPresentationNodeDetails,
} from "./types/PresentationNodeDetails";

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

  if (tableName === "DestinyPresentationNodeDefinition") {
    return <PresentationNodeDetails definition={definition} />;
  }

  return null;
};

export function displayDefinitionDetails(tableName: string, definition: any) {
  return (
    displayInventoryItemDetails(tableName, definition) ||
    displayVendorDetails(tableName) ||
    displayRecordDetails(tableName, definition) ||
    displayPresentationNodeDetails(tableName)
  );
}

export default DefinitionDetails;
