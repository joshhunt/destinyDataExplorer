import { BaseDestinyDefinition, ReduxStore } from "types";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import { useSelector } from "react-redux";

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

export function definitionFromStore(
  store: ReduxStore,
  tableName: string,
  hash: any
) {
  const { definitions: allDefinitions } = store.definitions;
  if (!allDefinitions) {
    return undefined;
  }

  if (isTableName(tableName, allDefinitions)) {
    return allDefinitions[tableName]?.[hash];
  }
}

// TODO: type hash to number or string or something
export function useDefinition(tableName: string, hash: any) {
  return useSelector((store: ReduxStore) => {
    return definitionFromStore(store, tableName, hash);
  });
}
