import { AnyDefinitionTable } from "./types";

export interface DefinitionsProgress {
  receivedLength: number;
  // definitions?: StoredDefinition;
}

export type DefinitionsProgressCallback = (
  progress: DefinitionsProgress
) => void;

export async function getDefinitionTableBase(
  tablePath: string,
  emitProgress: DefinitionsProgressCallback
): Promise<AnyDefinitionTable> {
  const res = await fetch(`https://www.bungie.net${tablePath}`);
  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Could not get reader");
  }

  // const contentLength = parseInt(res.headers.get("Content-Length") ?? "0") || 0;

  let receivedLength = 0;
  let chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    emitProgress({ receivedLength });
  }

  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  const result = new TextDecoder("utf-8").decode(chunksAll);
  const defs = JSON.parse(result);
  return defs;
}

export async function getDefinitionTable(
  tablePath: string,
  emitProgress: DefinitionsProgressCallback
): Promise<AnyDefinitionTable> {
  let defs: AnyDefinitionTable | undefined = undefined;
  let tries = 0;
  let lastError: any;

  const suffixes = [
    "",
    "?destiny-data-explorer",
    "?cb=" + Date.now(),
    "?cb=" + Math.ceil(Math.random() * 100_000),
  ];

  do {
    const suffix = suffixes[tries] ?? "";
    console.log("Fetching", tablePath, "with suffix", suffix, "on try", tries);
    tries += 1;

    try {
      defs = await getDefinitionTableBase(tablePath + suffix, emitProgress);
      break;
    } catch (err) {
      lastError = err;
    }
  } while (tries < suffixes.length);

  if (!defs) {
    throw lastError;
  }

  return defs;
}
