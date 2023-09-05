import { AnyDefinition } from "./types";

async function getDefinitionTableBase(
  tablePath: string
): Promise<AnyDefinition> {
  const req = await fetch(`https://www.bungie.net${tablePath}`);
  const defs = await req.json();

  return defs;
}

export async function getDefinitionTable(
  tablePath: string
): Promise<AnyDefinition> {
  let defs: AnyDefinition | undefined = undefined;
  let tries = 0;

  const suffixes = [
    "",
    "?destiny-data-explorer",
    "?cb=" + Date.now(),
    "?cb=" + Math.ceil(Math.random() * 100_000),
  ];

  do {
    const suffix = suffixes[tries];
    console.log("Getting table", { tablePath, suffix, tries });
    tries += 1;
    try {
      defs = await getDefinitionTableBase(tablePath + suffix);
    } catch (err) {
      if (tries > suffixes.length) {
        throw err;
      }
    }
  } while (!defs);

  return defs;
}
