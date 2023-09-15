export interface DefinitionsWorkerInit {
  type: "init";
}
export interface DefinitionsWorkerSearch {
  type: "search";
}

export interface DefinitionsWorkerThrows {
  type: "throws-exception";
}
export interface DefinitionsWorkerRejects {
  type: "rejects";
}

export type DefinitionsWorkerMessage =
  | DefinitionsWorkerInit
  | DefinitionsWorkerThrows
  | DefinitionsWorkerRejects
  | DefinitionsWorkerSearch;
