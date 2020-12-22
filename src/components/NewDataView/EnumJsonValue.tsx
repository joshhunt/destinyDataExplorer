import {
  getReferencedSchema,
  getShortSchemaNameFromRef,
} from "lib/apiSchemaUtils";
import React from "react";

import JsonValueAnnotation from "./JsonValueAnnotation";

interface EnumJsonValueProps {
  value: any;
  schemaRef: string;
}

const EnumJsonValue: React.FC<EnumJsonValueProps> = ({
  value,
  schemaRef,
  children,
}) => {
  const enumName = getShortSchemaNameFromRef(schemaRef);
  const enumSchema = getReferencedSchema(schemaRef);
  const enumValues = enumSchema?.["x-enum-values"] || [];
  const isBitmask = enumSchema?.["x-enum-is-bitmask"];
  const enumValue = enumValues.find((v) => v.numericValue === value.toString());

  let prettyName = enumValue?.identifier;

  if (isBitmask && enumValues) {
    let matchingValues = enumValues.filter(
      (v) => !!(value & parseInt(v.numericValue, 10))
    );

    const noneValue =
      matchingValues.length === 0 &&
      enumValues.find((v) => v.numericValue === "0");

    if (noneValue) {
      matchingValues = [noneValue];
    }

    prettyName = matchingValues.map((v) => `"${v.identifier}"`).join(", ");
  }

  return (
    <JsonValueAnnotation value={children}>
      {isBitmask
        ? `bitmask ${enumName} [${prettyName}]`
        : prettyName
        ? `enum ${enumName} "${prettyName}"`
        : `enum ${enumName}`}
    </JsonValueAnnotation>
  );
};

export default EnumJsonValue;
