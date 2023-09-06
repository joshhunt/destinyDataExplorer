import { WorkerPromise } from "../lib/workerPromise";

import { DefinitionsWorkerMessage } from "./types";

export const workerInterface = new WorkerPromise<
  DefinitionsWorkerMessage,
  unknown
>(() => {
  const worker = new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  });

  console.log("Created worker", worker);
  worker.postMessage("hello");

  return worker;
});
