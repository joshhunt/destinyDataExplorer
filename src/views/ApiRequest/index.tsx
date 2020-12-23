import Header from "components/Header";
import NewDataView from "components/NewDataView";
import React, { useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router";

import { ensureSchema, getOperation } from "../../lib/apiSchemaUtils";

import s from "./styles.module.scss";
import {
  Collapsed,
  useApiParams,
  makeApiRequestUrl,
  invertCollapsed,
  makeUrl,
} from "./utils";
import APIRequestEditor from "components/APIRequestEditor";
import DataViewsOverlay, {
  DefinitionEntry,
  parsePathParam,
} from "components/DataViewsOverlay";
import APIListOverlay from "components/APIListOverlay";
import { Link } from "react-router-dom";

interface ApiRequestViewProps {}

const ApiRequestView: React.FC<ApiRequestViewProps> = () => {
  const history = useHistory();
  const [menuOverlayVisible, setMenuOverlayVisible] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>();
  const [collapsed, setCollapsed] = useState(Collapsed.Unselected);

  const params = useParams<{ operationName: string; "0"?: string }>();
  const apiOperation = useMemo(() => getOperation(params.operationName), [
    params.operationName,
  ]);

  const definitionEntries = useMemo(
    () => (params["0"] ? parsePathParam(params["0"]) : []),
    [params]
  );

  const [
    [pathParams, setPathParams],
    [queryParams, setQueryParams],
  ] = useApiParams(apiOperation);

  const handleSubmit = useCallback(() => {
    const url = makeApiRequestUrl(apiOperation, pathParams, queryParams, true);

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

  const linkedDefinitionUrl = useCallback(
    ({ type, hash }: DefinitionEntry) => {
      const newItems = [...definitionEntries, { type, hash }];
      return makeUrl(newItems, params.operationName, pathParams, queryParams);
    },
    [definitionEntries, params.operationName, pathParams, queryParams]
  );

  const requestPopOverlay = useCallback(() => {
    const newItems = [...definitionEntries];
    newItems.pop();
    history.push(
      makeUrl(newItems, params.operationName, pathParams, queryParams)
    );
  }, [
    definitionEntries,
    history,
    params.operationName,
    pathParams,
    queryParams,
  ]);

  if (!apiOperation) {
    return <h1>could not find</h1>;
  }

  const responseSchema = ensureSchema(apiOperation.responses?.["200"]);

  const isCollapsed =
    collapsed === Collapsed.Unselected
      ? !!apiResponse
      : collapsed === Collapsed.Collapsed;

  return (
    <>
      <div className={s.root}>
        <div className={s.request}>
          <Header className={s.header}>
            <div className={s.headerBody}>
              <div className={s.headerMain}>
                <span
                  className={s.headerApiName}
                  onClick={() => setMenuOverlayVisible(true)}
                >
                  Request: <strong>{apiOperation.operationId}</strong>
                </span>
                <div>
                  <button
                    className={s.headerbutton}
                    onClick={() => setMenuOverlayVisible(true)}
                  >
                    API Library
                  </button>

                  <Link className={s.headerbutton} to="/">
                    Back to Definitions
                  </Link>
                </div>
              </div>
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
          {apiResponse && responseSchema && (
            <NewDataView
              data={apiResponse}
              schema={responseSchema}
              linkedDefinitionUrl={linkedDefinitionUrl}
            />
          )}
        </div>
      </div>

      <APIListOverlay
        visible={menuOverlayVisible}
        onRequestClose={() => setMenuOverlayVisible(false)}
      />

      <DataViewsOverlay
        items={definitionEntries}
        linkedDefinitionUrl={linkedDefinitionUrl}
        requestPopOverlay={requestPopOverlay}
      />
    </>
  );
};

export default ApiRequestView;
