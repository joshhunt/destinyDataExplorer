import React, { useMemo } from "react";

import s from "./styles.module.scss";
import { getApiPaths } from "../../lib/apiSchemaUtils";

interface ApiViewProps {}

const ApiView: React.FC<ApiViewProps> = () => {
  const apiPaths = useMemo(
    () =>
      getApiPaths().filter(
        (spec) => true || spec.operationId?.startsWith("Destiny2.")
      ),
    []
  );

  return (
    <div className={s.root}>
      <h1>Api View</h1>

      {apiPaths.map((spec) => (
        <div className={s.api}>
          <h2>{spec.operationId}</h2>

          <p>
            <strong>
              <code>
                {spec.method.toLocaleUpperCase()} {spec.path}
              </code>
            </strong>
          </p>

          <p>{spec.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ApiView;
