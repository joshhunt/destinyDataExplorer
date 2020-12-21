import { get, isString } from "lodash";

export function getLower(obj: any, path: string, fallback = "") {
  const g = get(obj, path, fallback);
  return g.toLowerCase ? g.toLowerCase() : g;
}

export const isImage = (value: string | number): value is string =>
  isString(value) && !!value.match(/\.(png|jpg|jpeg)$/);
