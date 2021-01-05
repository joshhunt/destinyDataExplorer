import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { get, isString } from "lodash";

export function getLower(obj: any, path: string, fallback = "") {
  const g = get(obj, path, fallback);
  return g.toLowerCase ? g.toLowerCase() : g;
}

export const isImage = (value: string | number): value is string =>
  isString(value) && !!value.match(/\.(png|jpg|jpeg)$/);

export function notEmpty<TValue>(
  value: TValue | null | undefined | boolean
): value is TValue {
  return value !== false && value !== null && value !== undefined;
}
