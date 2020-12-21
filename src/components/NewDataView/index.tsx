import React from "react";
import { OpenAPIV2 } from "openapi-types";
import JSONTree from "react-json-tree";
import { getPropertySchemaForPath } from "lib/apiSchemaUtils";

import s from "./styles.module.scss";
import LinkedJSONValue from "./LinkedJSONValue";
import EnumJsonValue from "./EnumJsonValue";
import { isImage } from "lib/utils";
import ImageJsonValue from "./ImageJsonValue";
import theme from "./theme";
import CSSThemeVariables from "components/CSSThemeVariables";

declare module "openapi-types/dist/index" {
  namespace OpenAPIV2 {
    interface SchemaObject {
      "x-mapped-definition"?: OpenAPIV2.ReferenceObject;
      "x-enum-reference"?: OpenAPIV2.ReferenceObject;
      "x-enum-values"?: {
        numericValue: string;
        identifier: string;
      }[];
    }

    interface ItemsObject {
      "x-enum-reference"?: OpenAPIV2.ReferenceObject;
    }
  }
}

interface NewDataViewProps {
  data: Object;
  schema: OpenAPIV2.SchemaObject;
}

const NewDataView: React.FC<NewDataViewProps> = ({ data, schema }) => {
  function valueRenderer(
    prettyValue: string,
    rawValue: any,
    ...itemPath: (string | number)[]
  ) {
    const propertySchema = getPropertySchemaForPath(schema, itemPath);
    if (!propertySchema) return prettyValue;

    const children = (
      <span onClick={() => console.log(propertySchema)}>{prettyValue}</span>
    );

    const definitionRef = propertySchema["x-mapped-definition"];
    const enumRef =
      propertySchema["x-enum-reference"] ||
      propertySchema.items?.["x-enum-reference"];

    if (definitionRef) {
      return (
        <LinkedJSONValue value={rawValue} schemaRef={definitionRef.$ref}>
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
        shouldExpandNode={(keyPath) => keyPath.length < 3}
        data={data}
        valueRenderer={valueRenderer}
        hideRoot={true}
      />
    </CSSThemeVariables>
  );
};

// export default NewDataView;
export default React.memo(NewDataView);
