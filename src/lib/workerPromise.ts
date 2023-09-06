let globalWorkerMessageId = 0;

type StoredCallback = (error: unknown, result: unknown) => void;

interface WorkerMessagePayload<T = unknown> {
  messageID: number;
  data: T;
}

interface WorkerResponsePayload<T = unknown> {
  messageID: number;
  returnValue: T;
}

export class WorkerPromise<Payload = unknown, ReturnValue = unknown> {
  createWorker: () => Worker;
  worker: Worker | undefined;
  callbacks: Record<number, StoredCallback> = {};

  constructor(createWorker: () => Worker) {
    this.createWorker = createWorker;
  }

  withWorker(): Worker {
    if (this.worker) {
      return this.worker;
    }

    this.worker = this.createWorker();

    this.worker.addEventListener("message", (event) => {
      const { messageID, error, result } = event.data;

      const callback = this.callbacks[messageID];
      if (callback) {
        callback(error, result);
      }
    });

    return this.worker;
  }

  post(data: Payload) {
    globalWorkerMessageId += 1;
    const messageID = globalWorkerMessageId;

    const payload: WorkerMessagePayload = {
      messageID: messageID,
      data,
    };

    return new Promise((resolve, reject) => {
      this.callbacks[messageID] = (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };

      console.log("posting", payload);
      this.withWorker().postMessage(payload);
    });
  }

  // This function is called within the worker context
  async onMessage(cb: (payload: Payload) => Promise<ReturnValue>) {
    self.onmessage = async function onWorkerMessage(
      event: MessageEvent<WorkerMessagePayload<Payload>>
    ) {
      console.log("Worker self.onmessage recieved data", event.data);
      const message = event.data;

      const returnValue = await cb(message.data);

      const returnPayload: WorkerResponsePayload = {
        messageID: message.messageID,
        returnValue,
      };

      self.postMessage(returnPayload);
    };
  }
}
