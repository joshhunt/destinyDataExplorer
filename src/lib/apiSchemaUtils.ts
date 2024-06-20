import { OpenAPIV3 } from "openapi-types";

import { notEmpty } from "./utils";
import apiSpec from "./apiSpecExtensions";

declare module "openapi-types/dist/index" {
  namespace OpenAPIV3 {
    interface ParameterObject {
      "x-display-name"?: string;
    }

    interface ArraySchemaObject {
      "x-mapped-definition"?: OpenAPIV3.ReferenceObject;
      "x-enum-reference"?: OpenAPIV3.ReferenceObject;
      "x-enum-is-bitmask"?: boolean;
      "x-enum-values"?: {
        numericValue: string;
        identifier: string;
      }[];
    }

    interface NonArraySchemaObject {
      "x-mapped-definition"?: OpenAPIV3.ReferenceObject;
      "x-enum-reference"?: OpenAPIV3.ReferenceObject;
      "x-enum-is-bitmask"?: boolean;
      "x-enum-values"?: {
        numericValue: string;
        identifier: string;
      }[];
      "x-custom-type"?: string;
      "x-display-name"?: string;
      "x-mobile-manifest-name"?: string;
    }
  }
}

function getParameters(operation: OpenAPIV3.OperationObject) {
  const pathParameters: OpenAPIV3.ParameterObject[] = [];
  const queryParameters: OpenAPIV3.ParameterObject[] = [];

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

// const METHODS = ["get" as const, "post" as const];
const METHODS = ["get" as const];
export function formatApiPath(path: string, spec: OpenAPIV3.PathItemObject) {
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
    .flatMap(([path, spec]) => spec && formatApiPath(path, spec))
    .filter(notEmpty);
}

export function getOperation(operationId: string) {
  for (const [path, spec] of Object.entries(apiSpec.paths) as [
    string,
    OpenAPIV3.PathItemObject
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

function isResponseObject(node: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | OpenAPIV3.ResponseObject): node is OpenAPIV3.ResponseObject {
  return 'content' in node
}

export function getReferencedSchema(ref: string) {
  const [, , section, name] = ref.split("/");

  let found:
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.SchemaObject
    | OpenAPIV3.ResponseObject
    | undefined = apiSpec.components?.schemas?.[getSchemaNameFromRef(ref)];

  if (!found && section === "responses") {
    found = apiSpec.components?.responses?.[name];
  } else if (!found && section === "schemas") {
    found = apiSpec.components?.schemas?.[name];
  }

  if (found && isResponseObject(found)) {
    const jsonResponse = found.content?.['application/json']
    if (jsonResponse && jsonResponse.schema) {
      found = jsonResponse.schema
    }
  }

  if (found && "$ref" in found) {
    throw new Error("Referenced schema can not be a reference schema itself");
  }

  if (found && isResponseObject(found)) {
    throw new Error("Expected a Schema object, found a ResponseObject");
  }

  return found;
}

// TODO: type this better, remove all the any casts
export function getPropertySchemaForPath(
  parentSchema: OpenAPIV3.SchemaObject,
  itemPath: (number | string)[]
) {
  const orderedPath = [...itemPath];
  orderedPath.reverse();

  let currentSpec:
    | OpenAPIV3.ArraySchemaObject
    | OpenAPIV3.NonArraySchemaObject = ensureSchema(parentSchema);

  orderedPath.forEach((pathElement, index) => {
    const isLast = index === orderedPath.length - 1;

    const potentialNewSpec =
      "properties" in currentSpec &&
      currentSpec.properties &&
      currentSpec.properties[pathElement];

    currentSpec =
      (potentialNewSpec && ensureSchema(potentialNewSpec)) || currentSpec;

    if (!currentSpec) {
      return;
    }

    const dontLookAtChildren = isLast && currentSpec.type === "object";

    const ref = dontLookAtChildren ? undefined : getRefForChildren(currentSpec);

    if (ref) {
      const foundSchema = getReferencedSchema(ref);
      currentSpec = foundSchema || currentSpec;
    }
  });

  return currentSpec;
}

function getRefForChildren(
  spec:
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.ArraySchemaObject
    | OpenAPIV3.NonArraySchemaObject
) {
  if ("$ref" in spec && spec.$ref) {
    return spec.$ref;
  }

  if ("allOf" in spec && spec.allOf?.[0]) {
    const zerothChildSpec = spec.allOf[0];

    if ("$ref" in zerothChildSpec && zerothChildSpec.$ref) {
      return zerothChildSpec.$ref;
    }
  }

  if ("additionalProperties" in spec) {
    const additionalProperties = spec.additionalProperties;

    if (
      additionalProperties &&
      typeof additionalProperties === "object" &&
      "$ref" in additionalProperties
    ) {
      return additionalProperties.$ref;
    }
  }

  if (
    "items" in spec &&
    spec.items &&
    "$ref" in spec.items &&
    spec.items.$ref
  ) {
    return spec.items.$ref;
  }
}

export function getEnumValuesForRef(ref: string) {
  const enumSpec = getReferencedSchema(ref);

  if (!enumSpec) {
    return;
  }

  return "x-enum-values" in enumSpec && enumSpec["x-enum-values"];
}

export function definitionNameFromRef(ref: string) {
  const bits = ref.split(".");
  return bits[bits.length - 1];
}

export function getSchemaFromDefinitionName(tableName: string) {
  const found = Object.entries(apiSpec.components?.schemas ?? {}).find(
    ([schemaKey, schema]) => {
      const shortName = getShortSchemaNameFromRef(schemaKey);
      return shortName === tableName;
    }
  );

  const schema = found?.[1];

  if (schema && "$ref" in schema) {
    return getReferencedSchema(schema.$ref);
  }

  return schema;
}

export function ensureSchema(
  schema:
    | undefined
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.ArraySchemaObject
    | OpenAPIV3.NonArraySchemaObject
) {
  if (!schema) {
    throw new Error("Schema is unexpectedly undefined");
  }

  if ("$ref" in schema) {
    const referenced = getReferencedSchema(schema.$ref);

    if (!referenced) {
      console.error("Referenced schema is unexpectedly undefined", {
        schema,
        referenced,
      });
      throw new Error("Referenced schema is unexpectedly undefined");
    }

    return referenced;
  }

  return schema;
}
