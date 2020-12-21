import { BaseDestinyDefinition } from "types";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";

export function getDisplayName(def: BaseDestinyDefinition) {
  return (
    def.displayProperties?.name ||
    def.progressDescription ||
    def.tierName ||
    def.statName
  );
}

export function isTableName(
  tableName: string,
  allDefinitionTables: Partial<AllDestinyManifestComponents>
): tableName is keyof AllDestinyManifestComponents {
  return tableName in allDefinitionTables;
}
