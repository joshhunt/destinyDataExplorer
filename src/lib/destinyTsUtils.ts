import { BaseDestinyDefinition, ReduxStore } from "types";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import { useSelector } from "react-redux";
import { CLASSES } from "./destinyEnums";
import { makeTypeShort } from "./destinyUtils";

const DUMMIES_HASH = 3109687656;

export function getDisplayName(def: BaseDestinyDefinition) {
  const v =
    def.displayProperties?.name ||
    def.progressDescription ||
    def.tierName ||
    def.statName ||
    def.powerCap ||
    def.categoryName;

  return typeof v === "string" ? v : v?.toString();
}

export function getIcon(item: BaseDestinyDefinition) {
  return (
    (item.displayProperties && item.displayProperties.icon) || item.iconImage
  );
}

export function itemTypeDisplayName(item: BaseDestinyDefinition, type: string) {
  const shortType = makeTypeShort(type);
  const classType = item.classType && CLASSES[item.classType];
  const official = item.itemTypeDisplayName;

  if (
    !official &&
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(DUMMIES_HASH)
  ) {
    return `${shortType}: Dummy item`;
  }

  return official ? `${shortType}: ${classType ?? ""}${official}` : shortType;
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

type DefinitionsStore = ReduxStore["definitions"]["definitions"];

// TODO: type hash to number or string or something
export function useDefinition(tableName: string, hash: any) {
  return useSelector((store: ReduxStore) => {
    return definitionFromStore(store, tableName, hash);
  });
}

export function useDefinitionTable<TTableName extends keyof DefinitionsStore>(
  tableName: TTableName
): DefinitionsStore[TTableName] {
  return useSelector(
    (store: ReduxStore) => store.definitions.definitions?.[tableName]
  );
}
