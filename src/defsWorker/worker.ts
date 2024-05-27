import { onMessage } from "../lib/workerPromise";

import { initDefinitions } from "./initDefinitions";
import initSearchFuse from "./initSearchFuse";
import { DefinitionsWorkerMessage } from "./types";

onMessage<DefinitionsWorkerMessage, unknown>(async (message, onProgress) => {
  switch (message.type) {
    case "init":
      return initDefinitions(onProgress, message.pretendVersion);

    case "throws-exception":
      throw new Error("this is an error i threw!");

    case "rejects":
      return Promise.reject("rejecting a promise");

    case "init-search-fuse":
      return initSearchFuse(message.version);

    default:
      throw new Error("Unknown message posted");
  }
});
