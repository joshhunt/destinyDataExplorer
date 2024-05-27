import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";

export type AnyDefinitionTable =
  AllDestinyManifestComponents[keyof AllDestinyManifestComponents];

export type AnyDefinition = AnyDefinitionTable[keyof AnyDefinitionTable];

export interface StoredDefinition {
  /** Manifest version this definition is from. */
  version: string;

  /** Definition table name, such as DestinyInventoryItemDefinition. */
  tableName: string;

  /** Definition hash (or other identifier) */
  key: string | number;

  /** The definition object itself. */
  definition: AnyDefinition;
}

export type StoredDefinitionInput = StoredDefinition;

export interface InitDefinitionsProgressVersionKnown {
  type: "version-known";
  version: string;
}

export type ProgressRecord = Record<string, [number, boolean]>;
export interface InitDefinitionsProgressTableProgress {
  type: "table-progress";
  progress: ProgressRecord;
}

export type InitDefinitionsProgressEvent =
  | InitDefinitionsProgressVersionKnown
  | InitDefinitionsProgressTableProgress;
