import { makeTypeShort } from "lib/destinyUtils";
import React from "react";
import { Link } from "react-router-dom";

import s from "./jsonStyles.module.scss";
import { getDisplayName, useDefinition } from "lib/destinyTsUtils";
import { definitionNameFromRef } from "lib/apiSchemaUtils";
import { DefinitionEntry } from "components/DataViewsOverlay";
import JsonValueAnnotation from "./JsonValueAnnotation";
import { BaseDestinyDefinition } from "types";
import { isAdvanced } from "lib/flags";

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

  return (
    <JsonValueAnnotation value={children}>
      <Link
        to={linkedDefinitionUrl({ type: linkedDefinitionName, hash: value })}
        className={s.linkedAnnotation}
      >
        <DefinitionDisplayAnnotation
          definition={definition}
          definitionName={shortDefinitionName}
        />
      </Link>
    </JsonValueAnnotation>
  );
};

export default LinkedJSONValue;

interface DefinitionDisplayAnnotationProps {
  definition: BaseDestinyDefinition;
  definitionName: string;
}

function swap16(val: number) {
  return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}

const DefinitionDisplayAnnotation: React.FC<DefinitionDisplayAnnotationProps> =
  ({ definition, definitionName }) => {
    const displayName = getDisplayName(definition);
    const parts: string[] = [definitionName];

    if (displayName) parts.push(`"${displayName}"`);
    if (isAdvanced()) {
      const hexIndex = swap16(definition?.index ?? 0)
        .toString(16)
        .toUpperCase();
      parts.push(`index: ${definition.index} (0x${hexIndex})`);
    }

    return (
      <>
        {"<"}
        {parts.join(" ")}
        {">"}
      </>
    );
  };
