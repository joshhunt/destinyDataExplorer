import { DefinitionEntry } from "components/DataViewsOverlay";
import { getOperation } from "lib/apiSchemaUtils";
import { makeTypeShort } from "lib/destinyUtils";
import { useCallback, useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router";
import { pickBy } from "lodash";
import memoizeOne from "memoize-one";
import { dequal as isDeepEqual } from "dequal";

export type Params = Record<string, string>;

function paramsToQueryString(
  params: Params,
  apiOperation: ReturnType<typeof getOperation>
) {
  const parametersSpec = apiOperation?.parameters ?? [];

  const qs = Object.entries(params)
    .filter(
      ([key, value]) =>
        // Filter out empty params, or those that arent in the request schema
        value &&
        parametersSpec.some((v) => ("name" in v ? v.name === key : true))
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return qs;
}

const memoizeObject = memoizeOne((x) => x, isDeepEqual);

function queryStringToParams(
  apiOperation: ReturnType<typeof getOperation>,
  search: string
) {
  const parametersSpec = apiOperation?.parameters ?? [];
  const searchParams = new URLSearchParams(search);

  // Filter out params that arent in the request schema
  const cleaned = Object.fromEntries(
    Array.from(searchParams.entries()).filter(([key]) =>
      parametersSpec.some((v) => ("name" in v ? v.name === key : true))
    )
  );

  return memoizeObject(cleaned);
}

export const useApiParams = (apiOperation: ReturnType<typeof getOperation>) => {
  const rLocation = useLocation();
  const rHistory = useHistory();
  const [apiParams, setApiParams] = useState<Params>(() =>
    queryStringToParams(apiOperation, rLocation.search)
  );

  const setApiParamsAndUrl = useCallback(
    (newParams) => {
      const qs = paramsToQueryString(newParams, apiOperation);
      const search = `?${qs}`;

      if (rLocation.search !== search) {
        rHistory.replace(search);
      }

      setApiParams(newParams);
    },
    [apiOperation, rHistory, rLocation.search]
  );

  // When the apiOperation (or params) change, check if we need to update the URL
  // with the params currently in state
  useEffect(() => {
    const qs = paramsToQueryString(apiParams, apiOperation);
    const search = `?${qs}`;
    const currentSearch = rLocation.search || "?";

    if (currentSearch !== search) {
      rHistory.replace(search);
    }
  }, [apiOperation, apiParams, rHistory, rLocation.search]);

  return [apiParams, setApiParamsAndUrl] as const;
};

export function makeApiRequestUrl(
  apiOperation: ReturnType<typeof getOperation>,
  apiParams: Params,
  encodeUrl?: boolean
) {
  if (!apiOperation) return;

  const pathParams = pickBy(apiParams, (value, key) => {
    return apiOperation.pathParameters.find((v) => v.name === key);
  });

  const queryParams = pickBy(apiParams, (value, key) =>
    apiOperation.queryParameters.find((v) => v.name === key)
  );

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

export function makeUrl(
  items: DefinitionEntry[],
  operationName: string | undefined,
  apiParams: Params
) {
  const defsPath = items
    .map((v) => `${makeTypeShort(v.type)}:${v.hash}`)
    .join("/");

  const qs = Object.entries(apiParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const urlEnd = `${defsPath}?${qs}`;

  return operationName ? `/api/${operationName}/${urlEnd}` : `/api/${urlEnd}`;
}

const REQUIRED_QUERY_PARAMS = ["components"];

export function isRequestValid(
  apiOperation: ReturnType<typeof getOperation>,
  apiParams: Params
) {
  if (!apiOperation) {
    return false;
  }

  const pathParamsValid = apiOperation.pathParameters.every(
    (param) => apiParams[param.name]
  );

  const queryParamsValid = apiOperation.queryParameters
    .filter((v) => REQUIRED_QUERY_PARAMS.includes(v.name))
    .every((param) => apiParams[param.name]);

  return pathParamsValid && queryParamsValid;
}
