import { BaseDestinyDefinition, ReduxStore } from "types";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import { useSelector } from "react-redux";

export function getDisplayName(def: BaseDestinyDefinition) {
  const v =
    def.displayProperties?.name ||
    def.progressDescription ||
    def.tierName ||
    def.statName ||
    def.powerCap;

  return typeof v === "string" ? v : v?.toString();
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

export function useDefinitionTable(
  tableName: keyof ReduxStore["definitions"]["definitions"]
) {
  return useSelector(
    (store: ReduxStore) => store.definitions.definitions?.[tableName]
  );
}
