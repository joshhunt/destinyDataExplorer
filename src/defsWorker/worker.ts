import { onMessage } from "../lib/workerPromise";

import { initDefinitions } from "./initDefinitions";
import { DefinitionsWorkerMessage } from "./types";

onMessage<DefinitionsWorkerMessage, unknown>(async (message, onProgress) => {
  switch (message.type) {
    case "init":
      return initDefinitions(onProgress);

    case "throws-exception":
      throw new Error("this is an error i threw!");

    case "rejects":
      return Promise.reject("rejecting a promise");

    default:
      throw new Error("Unknown message posted");
  }
});
