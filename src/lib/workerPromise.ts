let globalWorkerMessageId = 0;

type StoredCallback = (error: unknown, result: unknown) => void;

export class WorkerPromise<T> {
  worker: Worker;
  callbacks: Record<number, StoredCallback> = {};

  constructor(worker: Worker) {
    this.worker = worker;

    worker.addEventListener("message", (event) => {
      const { messageID, error, result } = event.data;

      const callback = this.callbacks[messageID];
      if (callback) {
        callback(error, result);
      }
    });
  }

  post(data: T) {
    globalWorkerMessageId += 1;
    const messageID = globalWorkerMessageId;

    const payload = {
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

      this.worker.postMessage(payload);
    });
  }
}
