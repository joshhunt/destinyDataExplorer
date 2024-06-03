import { DefinitionTable } from "lib/definitions/store";

export const SEARCH = "SEARCH";
export const LOAD_DEFINITIONS = "LOAD_DEFINITIONS";
export const LOAD_EXTRA_DEFINITIONS = "LOAD_EXTRA_DEFINITIONS";

export interface SearchWorkerMessage {
  type: typeof SEARCH;
  payload: {
    searchString: string;
    filters: any;
  };
}

export interface LoadDefinitionsWorkerMessage {
  type: typeof LOAD_DEFINITIONS;
  payload: {
    manifestVersion: string | undefined;
  };
}

export interface LoadExtraDefinitionsWorkerMessage {
  type: typeof LOAD_EXTRA_DEFINITIONS;
  payload: {
    definitions: Record<string, DefinitionTable>;
  };
}

export type WorkerMessage =
  | SearchWorkerMessage
  | LoadDefinitionsWorkerMessage
  | LoadExtraDefinitionsWorkerMessage;
