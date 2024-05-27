export interface DefinitionsWorkerInit {
  type: "init";
  pretendVersion?: string;
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

export interface DefinitionsWorkerInitSearchFuse {
  type: "init-search-fuse";
  version: string;
}

export type DefinitionsWorkerMessage =
  | DefinitionsWorkerInit
  | DefinitionsWorkerThrows
  | DefinitionsWorkerRejects
  | DefinitionsWorkerSearch
  | DefinitionsWorkerInitSearchFuse;
