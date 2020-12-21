import {
  getReferencedSchema,
  getShortSchemaNameFromRef,
} from "lib/apiSchemaUtils";
import React from "react";

import s from "./jsonStyles.module.scss";
import SelectBreak from "./SelectBreak";

interface EnumJsonValueProps {
  value: any;
  schemaRef: string;
}

const EnumJsonValue: React.FC<EnumJsonValueProps> = ({
  value,
  schemaRef,
  children,
}) => {
  const enumValues = getReferencedSchema(schemaRef);
  const enumName = getShortSchemaNameFromRef(schemaRef);
  const enumValueName = enumValues?.["x-enum-values"]?.find(
    (v) => v.numericValue === value.toString()
  );

  return (
    <>
      {children}
      <SelectBreak />
      <span
        className={s.unlinkedJsonValue}
        onClick={() => console.log(enumValues)}
      >
        {enumValueName
          ? `// enum ${enumName} "${enumValueName.identifier}"`
          : `// enum ${enumName}`}
      </span>
    </>
  );
};

export default EnumJsonValue;
