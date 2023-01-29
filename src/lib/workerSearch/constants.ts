export const SEARCH = "SEARCH";
export const LOAD_DEFINITIONS = "LOAD_DEFINITIONS";

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
    manifestVersion: string;
  };
}

export type WorkerMessage = SearchWorkerMessage | LoadDefinitionsWorkerMessage;
