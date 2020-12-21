import { DefinitionEntry } from "components/DataViewsOverlay";
import { getOperation } from "lib/apiSchemaUtils";
import { makeTypeShort } from "lib/destinyUtils";
import { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router";

export type Params = Record<string, string>;

export const useApiParams = (apiOperation: ReturnType<typeof getOperation>) => {
  const rLocation = useLocation();

  // TODO: clean all this up. use just this, and not state???
  const searchParams = new URLSearchParams(rLocation.search);
  const initialPathParams: Record<string, string> = {};
  const initialQueryParams: Record<string, string> = {};

  if (apiOperation) {
    for (const [key, value] of searchParams.entries()) {
      for (const param of apiOperation.pathParameters) {
        if (param.name === key) {
          initialPathParams[key] = value;
          break;
        }
      }

      for (const param of apiOperation.queryParameters) {
        if (param.name === key) {
          initialQueryParams[key] = value;
          break;
        }
      }
    }
  }

  const pathState = useState<Record<string, string>>(initialPathParams);
  const queryState = useState<Record<string, string>>(initialQueryParams);

  useURLUpdater(pathState[0], queryState[0]);

  return [pathState, queryState];
};

export function makeApiRequestUrl(
  apiOperation: ReturnType<typeof getOperation>,
  pathParams: Params,
  queryParams: Params,
  encodeUrl?: boolean
) {
  if (!apiOperation) return;

  let path = apiOperation.path;

  const qs = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  for (const [key, value] of Object.entries(pathParams)) {
    if (value) {
      const v = encodeUrl ? encodeURIComponent(value) : value;
      path = path.replace(`{${key}}`, v);
    }
  }

  if (qs.length > 1) {
    path = path + "?" + qs;
  }

  return `/Platform${path}`;
}

export enum Collapsed {
  Unselected = "Unselected",
  Collapsed = "Collapsed",
  Visible = "Visible",
}

export function invertCollapsed(v: Collapsed, isCollapsed: boolean) {
  if (v === Collapsed.Visible) {
    return Collapsed.Collapsed;
  }

  return isCollapsed ? Collapsed.Visible : Collapsed.Collapsed;
}

export function useURLUpdater(pathParams: Params, queryParams: Params) {
  const history = useHistory();

  useEffect(() => {
    const params = {
      ...pathParams,
      ...queryParams,
    };

    const qs = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    history.replace(`?${qs}`);
  }, [history, pathParams, queryParams]);
}

export function makeUrl(
  items: DefinitionEntry[],
  operationName: string,
  pathParams: Params,
  queryParams: Params
) {
  const defsPath = items
    .map((v) => `${makeTypeShort(v.type)}:${v.hash}`)
    .join("/");

  const qs = Object.entries({ ...pathParams, ...queryParams })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `/api/${operationName}/${defsPath}?${qs}`;
}
