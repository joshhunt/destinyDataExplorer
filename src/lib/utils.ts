import { get, isString } from "lodash";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function $RefreshSig$() {
  return () => {};
}

export function getShortTableName(name: string) {
  const match = name.match(/^Destiny(\w+)Definition/);
  return match && match[1];
}

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

/**
 * Returns parsed query string as a plain object
 */
export function useQuery() {
  const location = useLocation();
  const params = useMemo(() => {
    return Object.fromEntries(new URLSearchParams(location.search));
  }, [location.search]);

  return params;
}
