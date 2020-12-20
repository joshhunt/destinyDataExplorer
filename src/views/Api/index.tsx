import React, { useMemo } from "react";
import { OpenAPIV2 } from "openapi-types";

import _apispec from "../../lib/apispec.json";

import s from "./styles.module.scss";
import { getApiPaths } from "../../lib/apiSchemaUtils";

interface ApiViewProps {}

const apiSpec = (_apispec as unknown) as OpenAPIV2.Document;

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

          {(spec.pathParameters?.length ?? 0) > 0 && (
            <>
              <h4>Path parameters</h4>
              <ParameterList parameters={spec.pathParameters} />
            </>
          )}

          {(spec.queryParameters?.length ?? 0) > 0 && (
            <>
              <h4>Query parameters</h4>
              <ParameterList parameters={spec.queryParameters} />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

interface ParameterListProps {
  parameters: OpenAPIV2.Parameter[];
}

const ParameterList: React.FC<ParameterListProps> = ({ parameters }) => {
  return (
    <ul>
      {parameters.map((param) => {
        const itemsEnumReference: string | undefined =
          param.items?.["x-enum-reference"]?.$ref;

        const itemsEnumSchema = itemsEnumReference
          ? getReferencedSchema(itemsEnumReference)
          : undefined;

        return (
          <li>
            <code>{param.name}</code>{" "}
            {param.required && <span className={s.requiredTag}>required</span>}
            <br />
            Type: {param.type}
            <br />
            {param.description}
            {itemsEnumSchema && (
              <>
                <p>
                  <strong>Items:</strong>
                </p>
                {itemsEnumSchema.description}
                <br />
                <ul>
                  {getEnumValues(itemsEnumSchema)?.map((enumItem) => (
                    <li>
                      <code>{enumItem.numericValue}</code>:{" "}
                      {enumItem.identifier}
                      {enumItem.description && (
                        <>
                          <br />
                          {enumItem.description}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

function getReferencedSchema(ref: string) {
  const bits = ref.split("/");
  return apiSpec.definitions?.[bits[bits.length - 1]];
}

function getEnumValues(schema: OpenAPIV2.SchemaObject) {
  if (!schema["x-enum-values"]) {
    return undefined;
  }

  return schema["x-enum-values"] as {
    numericValue: string;
    identifier: string;
    description?: string;
  }[];
}

export default ApiView;
