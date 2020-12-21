export function parsePathSegment(segment: string) {
  const [type, hash] = segment.split(":");
  return { type: `Destiny${type}Definition`, hash };
}

export function parsePathParam(param: string) {
  if (!param) {
    return [];
  }

  return param.split("/").map(parsePathSegment);
}

export interface DefinitionEntry {
  type: string;
  hash: string;
}
