import { BaseDestinyDefinition, ReduxState } from "types";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import { useSelector } from "react-redux";
import { CLASSES } from "./destinyEnums";
import { makeTypeShorter } from "./destinyUtils";

const DUMMIES_HASH = 3109687656;
const PATTERNS_HASH = 3726054802;

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
  const shortType = makeTypeShorter(type);
  const classType = CLASSES[item.classType ?? 69];
  const official = item.itemTypeDisplayName;
  const includeClassType = Boolean(classType) && !official?.includes(official);

  if (!official && item.itemCategoryHashes) {
    if (item.itemCategoryHashes.includes(DUMMIES_HASH)) {
      return `${shortType}: Dummy item`;
    }
  }

  const typeParts = [
    item.itemCategoryHashes?.includes(DUMMIES_HASH) ? "Dummy" : undefined,
    includeClassType ? classType : undefined,
    official,
    item.itemCategoryHashes?.includes(PATTERNS_HASH) ? "Pattern" : undefined,
  ].filter(Boolean);

  return typeParts.length > 0
    ? `${shortType}: ${typeParts.join(" ")}`
    : shortType;
}

export function isTableName(
  tableName: string,
  allDefinitionTables: Partial<AllDestinyManifestComponents>
): tableName is keyof AllDestinyManifestComponents {
  return tableName in allDefinitionTables;
}

export function definitionFromStore(
  store: ReduxState,
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

type DefinitionsStore = ReduxState["definitions"]["definitions"];

// TODO: type hash to number or string or something
export function useDefinition(tableName: string, hash: any) {
  return useSelector((store: ReduxState) => {
    return definitionFromStore(store, tableName, hash);
  });
}

export function useDefinitionTable<TTableName extends keyof DefinitionsStore>(
  tableName: TTableName
): DefinitionsStore[TTableName] {
  return useSelector(
    (store: ReduxState) => store.definitions.definitions?.[tableName]
  );
}
