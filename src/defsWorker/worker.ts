/* eslint-disable no-restricted-globals */
import { onMessage } from "../lib/workerPromise";

import { loadDefinitions } from "./loadDefinitions";
import { DefinitionsWorkerMessage } from "./types";

onMessage<DefinitionsWorkerMessage, unknown>(async (message, onProgress) => {
  switch (message.type) {
    case "init":
      return loadDefinitions(onProgress);

    case "throws-exception":
      throw new Error("this is an error i threw!");

    case "rejects":
      return Promise.reject("rejecting a promise");

    default:
      throw new Error("Unknown message posted");
  }
});
