import { AnyDefinition, StoredDefinition } from "./types";

export interface DefinitionsProgress {
  receivedLength: number;
  definitions?: StoredDefinition;
}

export async function* getDefinitionTableBase(
  tablePath: string
): AsyncGenerator<DefinitionsProgress, void, void> {
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

    yield {
      receivedLength,
    };

    // console.log(`Received ${receivedLength} of ${contentLength}`);
  }

  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  const result = new TextDecoder("utf-8").decode(chunksAll);
  const defs = JSON.parse(result);

  yield {
    receivedLength,
    definitions: defs,
  };
}

export async function* getDefinitionTable(
  tablePath: string
): AsyncGenerator<DefinitionsProgress, void, void> {
  let defs: AnyDefinition | undefined = undefined;
  let tries = 0;

  const suffixes = [
    "?",
    "?destiny-data-explorer",
    "?cb=" + Date.now(),
    "?cb=" + Math.ceil(Math.random() * 100_000),
  ];

  do {
    const suffix = suffixes[tries];
    console.log("Getting table", { tablePath, suffix, tries });
    tries += 1;
    let defs: StoredDefinition | undefined;

    try {
      const gen = await getDefinitionTableBase(tablePath + suffix);

      for await (const progress of gen) {
        yield progress;
        defs = progress.definitions;

        if (defs) {
          console.log("returning defs", tablePath.split("-")[0]);
          return;
        }
      }
    } catch (err) {
      console.log("getDefinitionTable threw", err);
      if (tries > suffixes.length) {
        throw err;
      }
    }
  } while (!defs);
}
