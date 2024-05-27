import debugLib from "debug";

export function createDebug(loggerName: string) {
  const prefix = /// @ts-ignore
    typeof WorkerGlobalScope !== "undefined" &&
    /// @ts-ignore
    self instanceof WorkerGlobalScope
      ? "worker:"
      : "";

  const debug = debugLib(prefix + loggerName);
  debug.enabled = true;

  return debug;
}
