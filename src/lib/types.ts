import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";

export type AnyDefinitionTable =
  AllDestinyManifestComponents[keyof AllDestinyManifestComponents];

export type AnyDefinition = AnyDefinitionTable[keyof AnyDefinitionTable];

export interface StoredDefinition {
  /** Auto-incrementing ID for this definition, unique across *all* definitions
   * and tables. Does not match the definition hash or index.  */
  key: number;

  /** Definition table name, such as DestinyInventoryItemDefinition. */
  tableName: string;

  /** Manifest version this definition is from. */
  version: string;

  /** The definition object itself. */
  definition: AnyDefinition;
}

export type StoredDefinitionInput = Omit<StoredDefinition, "key">;

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
