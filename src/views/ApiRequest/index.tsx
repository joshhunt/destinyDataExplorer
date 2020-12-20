import NewDataView from "components/NewDataView";
import { OpenAPIV2 } from "openapi-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router";
import ParameterEditor from "../../components/ParameterEditor";
import { getOperation } from "../../lib/apiSchemaUtils";
import s from "./styles.module.scss";

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

const ApiRequestView: React.FC<ApiRequestViewProps> = () => {
  const history = useHistory();
  const [apiResponse, setApiResponse] = useState<any>();

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

  const filledInUrl = useMemo(() => {
    if (!apiOperation) return undefined;

    let path = apiOperation.path;

    const qs = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    for (const [key, value] of Object.entries(pathParams)) {
      if (value) {
        path = path.replace(`{${key}}`, value);
      }
    }

    if (qs.length > 1) {
      path = path + "?" + qs;
    }

    return path;
  }, [apiOperation, pathParams, queryParams]);

  const handleSubmit = useCallback(() => {
    fetch(`https://www.bungie.net/Platform${filledInUrl}`, {
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY ?? "",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => setApiResponse(data));
  }, [filledInUrl]);

  if (!apiOperation) {
    return <h1>could not find</h1>;
  }

  const response = apiOperation.responses["200"]?.schema as
    | OpenAPIV2.SchemaObject
    | undefined;

  return (
    <div className={s.root}>
      <h1>{apiOperation.operationId}</h1>
      <p>{apiOperation.description}</p>
      URL: <code>{apiOperation.path}</code>
      <br />
      URL: <code>{filledInUrl}</code>
      {apiOperation.pathParameters.length > 0 && (
        <>
          <h4>Path params</h4>
          <ParameterEditor
            parameters={apiOperation.pathParameters}
            values={pathParams}
            onChange={(v) => setPathParams(v)}
          />
        </>
      )}
      {apiOperation.queryParameters.length > 0 && (
        <>
          <h4>Query params</h4>
          <ParameterEditor
            parameters={apiOperation.queryParameters}
            values={queryParams}
            onChange={(v) => setQueryParams(v)}
          />
        </>
      )}
      <button onClick={handleSubmit} type="button">
        Submit
      </button>
      {apiResponse && response && (
        <NewDataView data={apiResponse} schema={response} />
      )}
    </div>
  );
};

export default ApiRequestView;
