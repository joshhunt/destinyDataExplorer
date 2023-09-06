export interface DefinitionsWorkerInit {
  type: "init";
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
  | DefinitionsWorkerRejects;
