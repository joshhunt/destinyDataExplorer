import React from "react";
import { OpenAPIV2 } from "openapi-types";
import JSONTree from "react-json-tree";
import { getPropertySchemaForPath } from "lib/apiSchemaUtils";

import s from "./styles.module.scss";
import LinkedJSONValue from "./LinkedJSONValue";

declare module "openapi-types/dist/index" {
  namespace OpenAPIV2 {
    interface SchemaObject {
      "x-mapped-definition"?: OpenAPIV2.ReferenceObject;
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

    if (!propertySchema) {
      return prettyValue;
    }

    const mappedDefinitionRef = propertySchema["x-mapped-definition"];

    if (mappedDefinitionRef) {
      const linkedDefinitionName = definitionNameFromRef(
        mappedDefinitionRef.$ref
      );

      return (
        <LinkedJSONValue
          value={rawValue}
          linkedDefinitionName={linkedDefinitionName}
        >
          {prettyValue}
        </LinkedJSONValue>
      );
    }

    return (
      <>
        {prettyValue}{" "}
        <span className={s.comment}>
          {" // "}
          {propertySchema.description}
        </span>
      </>
    );
  }

  return (
    <JSONTree
      theme={{
        tree: s.root,
      }}
      shouldExpandNode={(keyPath) => keyPath.length < 3}
      data={data}
      valueRenderer={valueRenderer}
      hideRoot={true}
    />
  );
};

function definitionNameFromRef(ref: string) {
  const bits = ref.split(".");
  return bits[bits.length - 1];
}

// export default NewDataView;
export default React.memo(NewDataView);
