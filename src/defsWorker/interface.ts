import { WorkerPromise } from "../lib/workerPromise";

import { DefinitionsWorkerMessage } from "./types";

export const workerInterface = new WorkerPromise<
  DefinitionsWorkerMessage,
  unknown
>(
  () =>
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    })
);
