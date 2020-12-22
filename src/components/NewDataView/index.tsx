import React from "react";
import { OpenAPIV3 } from "openapi-types";
import JSONTree from "react-json-tree";
import { getPropertySchemaForPath } from "lib/apiSchemaUtils";

import s from "./styles.module.scss";
import LinkedJSONValue from "./LinkedJSONValue";
import EnumJsonValue from "./EnumJsonValue";
import { isImage } from "lib/utils";
import ImageJsonValue from "./ImageJsonValue";
import theme from "./theme";
import CSSThemeVariables from "components/CSSThemeVariables";
import { DefinitionEntry } from "components/DataViewsOverlay/utils";

declare module "openapi-types/dist/index" {
  namespace OpenAPIV3 {
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
    }
  }
}

interface NewDataViewProps {
  data: any;
  schema?: OpenAPIV3.SchemaObject;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

const NewDataView: React.FC<NewDataViewProps> = ({
  data,
  schema,
  linkedDefinitionUrl,
}) => {
  function valueRenderer(
    prettyValue: string,
    rawValue: any,
    ...itemPath: (string | number)[]
  ) {
    const propertySchema = schema && getPropertySchemaForPath(schema, itemPath);
    if (!propertySchema) return prettyValue;

    const children = (
      <span onClick={() => console.log(propertySchema)}>{prettyValue}</span>
    );

    const definitionRef = propertySchema["x-mapped-definition"];

    const enumRef =
      propertySchema["x-enum-reference"] ||
      ("items" in propertySchema &&
        "x-enum-reference" in propertySchema.items &&
        propertySchema.items["x-enum-reference"]);

    if (definitionRef) {
      return (
        <LinkedJSONValue
          value={rawValue}
          schemaRef={definitionRef.$ref}
          linkedDefinitionUrl={linkedDefinitionUrl}
        >
          {children}
        </LinkedJSONValue>
      );
    }

    if (enumRef) {
      return (
        <EnumJsonValue value={rawValue} schemaRef={enumRef.$ref}>
          {children}
        </EnumJsonValue>
      );
    }

    if (isImage(rawValue)) {
      return <ImageJsonValue value={rawValue} />;
    }

    return children;
  }

  return (
    <CSSThemeVariables theme={theme}>
      <JSONTree
        theme={{
          tree: s.root,
          ...theme,
        }}
        shouldExpandNode={(keyPath) =>
          keyPath.includes("Response") ? keyPath.length < 3 : keyPath.length < 1
        }
        data={data}
        valueRenderer={valueRenderer}
        hideRoot={true}
      />
    </CSSThemeVariables>
  );
};

// export default NewDataView;
export default React.memo(NewDataView);
