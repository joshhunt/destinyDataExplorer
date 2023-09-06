import { WorkerPromise } from "../lib/workerPromise";

import { DefinitionsWorkerMessage } from "./types";

export const workerInterface = new WorkerPromise<DefinitionsWorkerMessage>(
  () =>
    new Worker(new URL("./worker", import.meta.url), {
      type: "module",
    })
);
