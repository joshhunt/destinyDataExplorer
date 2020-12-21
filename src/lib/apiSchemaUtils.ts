import { OpenAPIV2 } from "openapi-types";

import _apispec from "./apispec.json";
import { notEmpty } from "./utils";

const apiSpec = (_apispec as unknown) as OpenAPIV2.Document;

function getParameters(operation: OpenAPIV2.OperationObject) {
  const pathParameters: OpenAPIV2.Parameter[] = [];
  const queryParameters: OpenAPIV2.Parameter[] = [];

  for (const param of operation.parameters ?? []) {
    if ("name" in param) {
      if (param.in === "path") {
        pathParameters.push(param);
      } else if (param.in === "query") {
        queryParameters.push(param);
      } else {
        console.warn(`Unknown parameter in ${operation.operationId}`, {
          param,
          operation,
        });
      }
    }
  }

  return {
    pathParameters,
    queryParameters,
  };
}

const METHODS = ["get" as const, "post" as const];
export function formatApiPath(path: string, spec: OpenAPIV2.PathItemObject) {
  return METHODS.map((method) => {
    const operation = spec[method];
    if (!operation) return null;

    const params = getParameters(operation);

    return spec[method]
      ? {
          ...operation,
          ...params,
          path,
          method,
        }
      : null;
  }).filter(notEmpty);
}

export function getApiPaths() {
  return Object.entries(apiSpec.paths)
    .flatMap(([path, spec]: [string, OpenAPIV2.PathItemObject]) =>
      formatApiPath(path, spec)
    )
    .map((spec) => {
      spec.parameters?.forEach((param) => {
        if ("type" in param) {
          if (
            param.type === "integer" ||
            param.type === "string" ||
            param.type === "boolean"
          ) {
          } else if (
            param.type === "array" &&
            param.items?.["x-enum-reference"]
          ) {
          } else {
            console.warn("look at param type", param.type, param);
          }
        }
      });

      return spec;
    });
}

export function getOperation(operationId: string) {
  for (const [path, spec] of Object.entries(apiSpec.paths) as [
    string,
    OpenAPIV2.PathItemObject
  ][]) {
    for (const method of METHODS) {
      const operation = spec[method];
      if (!operation) continue;

      if (operation.operationId === operationId) {
        return formatApiPath(path, spec)[0]; // TODO: handle method
      }
    }
  }
}

export function getSchemaNameFromRef(ref: string) {
  const bits = ref.split("/");
  return bits[bits.length - 1];
}

export function getShortSchemaNameFromRef(ref: string) {
  const name = getSchemaNameFromRef(ref);
  const bits = name.split(".");
  return bits[bits.length - 1];
}

export function getReferencedSchema(ref: string) {
  return apiSpec.definitions?.[getSchemaNameFromRef(ref)];
}

// TODO: type this better, remove all the any casts
export function getPropertySchemaForPath(
  parentSchema: OpenAPIV2.SchemaObject,
  itemPath: (number | string)[]
) {
  const orderedPath = [...itemPath];
  orderedPath.reverse();

  let currentSpec = parentSchema;

  orderedPath.forEach((pathElement) => {
    const potentialNewSpec =
      currentSpec.properties && currentSpec.properties[pathElement];

    currentSpec = potentialNewSpec || currentSpec;

    if (!currentSpec) {
      return;
    }

    const ref: string | undefined =
      currentSpec.$ref ||
      (currentSpec.allOf && (currentSpec.allOf[0] as any).$ref) ||
      (currentSpec.additionalProperties &&
        (currentSpec.additionalProperties as any).$ref) ||
      (currentSpec.items && currentSpec.items.$ref);

    if (ref) {
      const foundSchema = getReferencedSchema(ref);
      currentSpec = foundSchema || currentSpec;
    }
  });

  return currentSpec;
}

export function getEnumValuesForRef(ref: string) {
  const enumSpec = getReferencedSchema(ref);

  if (!enumSpec) {
    return;
  }

  return enumSpec["x-enum-values"];
}

export function definitionNameFromRef(ref: string) {
  const bits = ref.split(".");
  return bits[bits.length - 1];
}

export function getSchemaFromDefinitionName(tableName: string) {
  const found = Object.entries(apiSpec.definitions ?? {}).find(
    ([schemaKey, schema]) => {
      const shortName = getShortSchemaNameFromRef(schemaKey);
      return shortName === tableName;
    }
  );

  return found?.[1];
}
