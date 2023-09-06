/* eslint-disable no-restricted-globals */
import { workerInterface } from "./interface";

workerInterface.onMessage(async (message) => {
  console.log("workerInterface.onMessage", message);

  switch (message.type) {
    case "init":
      return handleInit();

    default:
      throw new Error("Unknown message posted");
  }
});

async function handleInit() {
  console.log("hello from handleInit!");
  return Promise.resolve("hello world");
}
