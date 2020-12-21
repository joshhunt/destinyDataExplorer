import Header from "components/Header";
import NewDataView from "components/NewDataView";
import { OpenAPIV2 } from "openapi-types";
import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";

import ParameterEditor from "../../components/ParameterEditor";
import { getOperation } from "../../lib/apiSchemaUtils";

import AnimateHeight from "react-animate-height";

import s from "./styles.module.scss";
import Icon from "components/Icon";
import { Collapsed, useApiParams, makeUrl, invertCollapsed } from "./utils";
import APIRequestEditor from "components/APIRequestEditor";

interface ApiRequestViewProps {}

const ApiRequestView: React.FC<ApiRequestViewProps> = () => {
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

        <APIRequestEditor
          className={s.requestEditor}
          apiOperation={apiOperation}
          isCollapsed={isCollapsed}
          pathParams={pathParams}
          queryParams={queryParams}
          onPathParamsChange={setPathParams}
          onQueryParamsChange={setQueryParams}
          onSubmit={handleSubmit}
          onToggleCollapsed={() =>
            setCollapsed((v) => invertCollapsed(v, isCollapsed))
          }
        />
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
