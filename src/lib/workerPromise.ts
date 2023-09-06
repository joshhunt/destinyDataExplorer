let globalWorkerMessageId = 0;

type StoredCallback = (workerResponse: WorkerResponsePayload) => void;

interface WorkerMessagePayload<T = unknown> {
  messageID: number;
  data: T;
}

interface WorkerResponsePayload<T = unknown> {
  messageID: number;
  result: T | undefined;
  error?: string;
}

export class WorkerPromise<Payload = unknown> {
  worker: Worker | undefined;
  callbacks: Record<number, StoredCallback> = {};
  progressCallbacks: Record<number, StoredCallback> = {};
  loadWorker: () => Worker;

  constructor(loadWorker: () => Worker) {
    this.loadWorker = loadWorker;
  }

  withWorker(): Worker {
    if (this.worker) {
      return this.worker;
    }

    this.worker = this.loadWorker();

    this.worker.addEventListener("message", (event) => {
      const { messageID, progressEvent } = event.data;

      if (progressEvent) {
        const callback = this.progressCallbacks[messageID];
        if (callback) {
          callback(progressEvent);
        }
      } else {
        const callback = this.callbacks[messageID];
        if (callback) {
          callback(event.data);
        }
      }
    });

    return this.worker;
  }

  post(data: Payload, onProgress: (progressEvent: any) => void) {
    globalWorkerMessageId += 1;
    const messageID = globalWorkerMessageId;

    const payload: WorkerMessagePayload = {
      messageID: messageID,
      data,
    };

    this.progressCallbacks[messageID] = (progressEvent: any) => {
      onProgress(progressEvent);
    };

    return new Promise((resolve, reject) => {
      this.callbacks[messageID] = ({ result, error }) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };

      this.withWorker().postMessage(payload);
    });
  }
}

type WorkerRegistrationFunction<Payload, Return> = (
  payload: Payload,
  progressCallback: (arg: any) => void
) => Return | Promise<Return>;

// This function is called within the worker context
export async function onMessage<Payload, ReturnValue>(
  cb: WorkerRegistrationFunction<Payload, ReturnValue>
) {
  self.onmessage = async function onWorkerMessage(
    event: MessageEvent<WorkerMessagePayload<Payload>>
  ) {
    const message = event.data;

    function progressCallback(progressEvent: any) {
      self.postMessage({
        messageID: message.messageID,
        progressEvent,
      });
    }

    Promise.resolve(cb(message.data, progressCallback))
      .then((result) => {
        const returnPayload: WorkerResponsePayload = {
          messageID: message.messageID,
          result,
        };

        self.postMessage(returnPayload);
      })
      .catch((err) => {
        const returnPayload: WorkerResponsePayload = {
          messageID: message.messageID,
          result: undefined,
          error: err.message ?? err.toString?.() ?? "unknown error",
        };

        self.postMessage(returnPayload);
      });
  };
}
