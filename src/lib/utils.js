import { get } from "lodash";

export function getLower(obj, path, fallback = "") {
  const g = get(obj, path, fallback);
  return g.toLowerCase ? g.toLowerCase() : g;
}
