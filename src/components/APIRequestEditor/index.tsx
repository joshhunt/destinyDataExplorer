import Icon from "components/Icon";
import cx from "classnames";
import ParameterEditor from "components/ParameterEditor";
import { getOperation } from "lib/apiSchemaUtils";
import React, { useMemo } from "react";

import AnimateHeight from "react-animate-height";
import { makeApiRequestUrl, Params } from "views/ApiRequest/utils";

import s from "./styles.module.scss";
import { notEmpty } from "lib/utils";
import { DestinyProfileResponse } from "bungie-api-ts/destiny2";

interface APIRequestEditorProps {
  className?: string;
  isLoading: boolean;
  apiOperation: ReturnType<typeof getOperation>;
  apiParams: Params;
  isCollapsed: boolean;
  destinyProfile: DestinyProfileResponse | undefined;
  onSubmit: () => void;
  onToggleCollapsed: () => void;
  onPathParamsChange: (params: Params) => void;
  onQueryParamsChange: (params: Params) => void;
}

const APIRequestEditor: React.FC<APIRequestEditorProps> = ({
  className,
  isLoading,
  apiOperation,
  apiParams,
  isCollapsed,
  destinyProfile,
  onSubmit,
  onToggleCollapsed,
  onPathParamsChange,
  onQueryParamsChange,
}) => {
  const displayUrl = useMemo(
    () => makeApiRequestUrl(apiOperation, apiParams),
    [apiOperation, apiParams]
  );

  const fakeHeaderParams = [
    {
      name: "$auth",
      "x-display-name": "Authorization",
      in: "headers",
      description:
        "OAuth 2.0 header for access to protected endpoints and data.",
      schema: {
        "x-custom-type": "x-dx-authorization",
      },
    },
  ].filter(notEmpty);

  return (
    <div className={cx(s.requestEditor, className)}>
      <div className={s.urlBar}>
        <div className={s.url}>
          <span className={s.urlPrefix}>https://www.bungie.net</span>
          {displayUrl}
        </div>

        <div className={s.urlActions}>
          <button
            className={s.submitButton}
            onClick={onSubmit}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>

          <button className={s.actionButton} onClick={onToggleCollapsed}>
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

      {apiOperation && (
        <AnimateHeight height={isCollapsed ? 0 : "auto"}>
          <p className={s.description}>{apiOperation.description}</p>

          {apiOperation.pathParameters.length > 0 && (
            <ParameterEditor
              className={s.params}
              title="Path params"
              parameters={apiOperation.pathParameters}
              values={apiParams}
              destinyProfile={destinyProfile}
              onChange={onPathParamsChange}
            />
          )}

          {apiOperation.queryParameters.length > 0 && (
            <ParameterEditor
              className={s.params}
              title="Query params"
              parameters={apiOperation.queryParameters}
              values={apiParams}
              destinyProfile={destinyProfile}
              onChange={onQueryParamsChange}
            />
          )}

          {fakeHeaderParams && (
            <ParameterEditor
              className={s.params}
              title="Headers"
              parameters={fakeHeaderParams}
              values={apiParams}
              destinyProfile={destinyProfile}
              onChange={onQueryParamsChange}
            />
          )}
        </AnimateHeight>
      )}
    </div>
  );
};

export default APIRequestEditor;
