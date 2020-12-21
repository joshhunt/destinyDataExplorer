import Header from "components/Header";
import NewDataView from "components/NewDataView";
import { OpenAPIV2 } from "openapi-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router";

import ParameterEditor from "../../components/ParameterEditor";
import { getOperation } from "../../lib/apiSchemaUtils";

import AnimateHeight from "react-animate-height";

import s from "./styles.module.scss";
import Icon from "components/Icon";

interface ApiRequestViewProps {}

const useApiParams = (apiOperation: ReturnType<typeof getOperation>) => {
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

  return [pathState, queryState];
};

function makeUrl(
  apiOperation: ReturnType<typeof getOperation>,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
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

enum Collapsed {
  Unselected = "Unselected",
  Collapsed = "Collapsed",
  Visible = "Visible",
}

function invertCollapsed(v: Collapsed, isCollapsed: boolean) {
  if (v === Collapsed.Visible) {
    return Collapsed.Collapsed;
  }

  return isCollapsed ? Collapsed.Visible : Collapsed.Collapsed;
}

const ApiRequestView: React.FC<ApiRequestViewProps> = () => {
  const history = useHistory();
  const [apiResponse, setApiResponse] = useState<any>();
  const [collapsed, setCollapsed] = useState(Collapsed.Unselected);

  const params = useParams<{ operationName: string }>();
  const apiOperation = useMemo(() => getOperation(params.operationName), [
    params.operationName,
  ]);

  const [
    [pathParams, setPathParams],
    [queryParams, setQueryParams],
  ] = useApiParams(apiOperation);

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

  const displayUrl = useMemo(
    () => makeUrl(apiOperation, pathParams, queryParams),
    [apiOperation, pathParams, queryParams]
  );

  const handleSubmit = useCallback(() => {
    const url = makeUrl(apiOperation, pathParams, queryParams, true);

    fetch(`https://www.bungie.net${url}`, {
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY ?? "",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => setApiResponse(data));
  }, [apiOperation, pathParams, queryParams]);

  if (!apiOperation) {
    return <h1>could not find</h1>;
  }

  const response = apiOperation.responses["200"]?.schema as
    | OpenAPIV2.SchemaObject
    | undefined;

  const isCollapsed =
    collapsed === Collapsed.Unselected
      ? !!apiResponse
      : collapsed === Collapsed.Collapsed;

  return (
    <div className={s.root}>
      <div className={s.request}>
        <Header className={s.header}>
          <div className={s.headerBody}>
            <div className={s.headerMain}>{apiOperation.operationId}</div>
          </div>
        </Header>

        <div className={s.requestEditor}>
          <div className={s.urlBar}>
            <div className={s.url}>
              <span className={s.urlPrefix}>https://www.bungie.net</span>
              {displayUrl}
            </div>

            <div className={s.urlActions}>
              <button
                className={s.submitButton}
                onClick={handleSubmit}
                type="button"
              >
                Submit
              </button>

              <button
                className={s.actionButton}
                onClick={() =>
                  setCollapsed((v) => invertCollapsed(v, isCollapsed))
                }
              >
                {isCollapsed ? (
                  <span key="up">
                    <Icon name="chevron-up" />
                  </span>
                ) : (
                  <span key="down">
                    <Icon name="chevron-down" />
                  </span>
                )}
              </button>
            </div>
          </div>

          <AnimateHeight height={isCollapsed ? 0 : "auto"}>
            {apiOperation.pathParameters.length > 0 && (
              <ParameterEditor
                className={s.params}
                title="Path params"
                parameters={apiOperation.pathParameters}
                values={pathParams}
                onChange={(v) => setPathParams(v)}
              />
            )}

            {apiOperation.queryParameters.length > 0 && (
              <ParameterEditor
                className={s.params}
                title="Query params"
                parameters={apiOperation.queryParameters}
                values={queryParams}
                onChange={(v) => setQueryParams(v)}
              />
            )}
          </AnimateHeight>
        </div>
      </div>

      <div className={s.response}>
        {apiResponse && response && (
          <NewDataView data={apiResponse} schema={response} />
        )}
      </div>
    </div>
  );
};

export default ApiRequestView;
