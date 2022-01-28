import {
  AllDestinyManifestComponents,
  DestinyObjectiveDefinition,
  DestinyInventoryItemDefinition,
  DestinyHistoricalStatsDefinition,
  DestinyPowerCapDefinition,
  DestinyVendorGroupDefinition,
} from "bungie-api-ts/destiny2";

export type AnyDefinitionTable =
  AllDestinyManifestComponents[keyof AllDestinyManifestComponents];
export type AnyDefinition = AnyDefinitionTable[keyof AnyDefinitionTable];

export interface BaseDestinyDefinition
  extends Partial<
    DestinyInventoryItemDefinition &
      DestinyObjectiveDefinition &
      DestinyHistoricalStatsDefinition &
      DestinyPowerCapDefinition &
      DestinyVendorGroupDefinition
  > {
  tierName?: string;
}

export interface ReduxState {
  definitions: {
    definitions: Partial<AllDestinyManifestComponents>;
  };
}

export interface WrappedDefinition {
  type: string;
  def: AnyDefinition;
}

export type PathForItemFn = (
  tableName: string,
  definition: AnyDefinition
) => string;
