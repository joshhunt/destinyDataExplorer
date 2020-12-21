import { makeTypeShort } from "lib/destinyUtils";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import s from "./jsonStyles.module.scss";
import { getDisplayName, isTableName } from "lib/destinyTsUtils";
import { ReduxStore } from "types";
import { definitionNameFromRef } from "lib/apiSchemaUtils";
import SelectBreak from "./SelectBreak";

interface LinkedJSONValueProps {
  value: any;
  schemaRef: string;
}

const LinkedJSONValue: React.FC<LinkedJSONValueProps> = ({
  value,
  schemaRef: ref,
  children,
}) => {
  const linkedDefinitionName = definitionNameFromRef(ref);
  const shortDefinitionName = makeTypeShort(linkedDefinitionName);
  const definition = useSelector((store: ReduxStore) => {
    const { definitions: allDefinitions } = store.definitions;
    if (!allDefinitions) {
      return undefined;
    }

    if (isTableName(linkedDefinitionName, allDefinitions)) {
      return allDefinitions[linkedDefinitionName]?.[value];
    }
  });

  if (!definition) {
    return <>{children}</>;
  }

  const displayName = getDisplayName(definition);

  return (
    <>
      {children}
      <SelectBreak />
      <span className={s.unlinkedJsonValue}>{" // "}</span>
      <Link
        to={`/i/${shortDefinitionName}:${value}`}
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
