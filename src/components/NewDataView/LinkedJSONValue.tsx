import { makeTypeShort } from "lib/destinyUtils";
import React from "react";
import { Link } from "react-router-dom";

import s from "./jsonStyles.module.scss";
import { getDisplayName, useDefinition } from "lib/destinyTsUtils";
import { definitionNameFromRef } from "lib/apiSchemaUtils";
import SelectBreak from "./SelectBreak";
import Separator from "./Separator";
import { DefinitionEntry } from "components/DataViewsOverlay";

interface LinkedJSONValueProps {
  value: any;
  schemaRef: string;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

const LinkedJSONValue: React.FC<LinkedJSONValueProps> = ({
  value,
  linkedDefinitionUrl,
  schemaRef: ref,
  children,
}) => {
  const linkedDefinitionName = definitionNameFromRef(ref);
  const shortDefinitionName = makeTypeShort(linkedDefinitionName);
  const definition = useDefinition(linkedDefinitionName, value);

  if (!definition) {
    return <>{children}</>;
  }

  const displayName = getDisplayName(definition);

  return (
    <>
      {children}
      <SelectBreak />
      <Separator />
      <Link
        to={linkedDefinitionUrl({ type: linkedDefinitionName, hash: value })}
        className={s.linkedJsonValue}
      >
        {displayName
          ? `<${shortDefinitionName} "${displayName}">`
          : `<${shortDefinitionName}>`}
      </Link>
    </>
  );
};

export default LinkedJSONValue;
