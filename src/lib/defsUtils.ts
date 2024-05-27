import { PrimaryKey } from "./types";

export function serialiseKey(key: PrimaryKey) {
  return key[0] + key[1] + key[2];
}
