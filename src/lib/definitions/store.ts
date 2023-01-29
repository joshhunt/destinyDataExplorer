import IndexedDBStore from "lib/IndexedDBStore";

const DATABASE_NAME = "data-explorer";
const STORE_NAME = "definitions";

export type Hash = string;
export type GenericDefinition = any;
export type DefinitionTable = Record<Hash, GenericDefinition>;

export interface StoredDefinition {
  tableName: string;
  version: string;
  definitions: DefinitionTable;
}

export const definitionsStore = new IndexedDBStore(DATABASE_NAME, STORE_NAME);

export function isStoredDefinition(obj: any): obj is StoredDefinition {
  return (
    obj &&
    typeof obj.tableName === "string" &&
    typeof obj.version === "string" &&
    typeof obj.definitions === "object"
  );
}

export async function getStoredDefinitions(): Promise<StoredDefinition[]> {
  const values = await definitionsStore.getAll();
  return values.filter(isStoredDefinition);
}
