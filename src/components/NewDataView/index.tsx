import React from "react";
import { OpenAPIV2 } from "openapi-types";
import JSONTree from "react-json-tree";
import { Link } from "react-router-dom";
import { getPropertySchemaForPath } from "lib/apiSchemaUtils";

import s from "./styles.module.scss";
import { makeTypeShort } from "lib/destinyUtils";

interface NewDataViewProps {
  data: Object;
  schema: OpenAPIV2.SchemaObject;
}

const NewDataView: React.FC<NewDataViewProps> = ({ data, schema }) => {
  console.log("---------");
  function valueRenderer(
    prettyValue: string,
    rawValue: any,
    ...itemPath: (string | number)[]
  ) {
    const propertySchema = getPropertySchemaForPath(schema, itemPath);

    if (!propertySchema) {
      return prettyValue;
    }

    const mappedDefinitionRef = propertySchema["x-mapped-definition"] as
      | OpenAPIV2.ReferenceObject
      | undefined;

    console.log(rawValue, {
      itemPath,
      propertySchema,
      mappedDefinitionRef,
    });

    return (
      <>
        {prettyValue}{" "}
        {mappedDefinitionRef && (
          <Link
            to={`/i/${makeTypeShort(
              definitionNameFromRef(mappedDefinitionRef.$ref)
            )}:${rawValue}`}
            className={s.comment}
          >
            {" >> "} {definitionNameFromRef(mappedDefinitionRef.$ref)}
          </Link>
        )}
        <span className={s.comment}> // {propertySchema.description}</span>
      </>
    );
  }

  return <JSONTree data={data} valueRenderer={valueRenderer} hideRoot={true} />;
};

function definitionNameFromRef(ref: string) {
  const bits = ref.split(".");
  return bits[bits.length - 1];
}

export default NewDataView;
