import React from "react";
import NewDataView from "components/NewDataView";
import { getSchemaFromDefinitionName } from "lib/apiSchemaUtils";

import s from "./styles.module.scss";
import { DefinitionEntry } from "components/DataViewsOverlay";
import BungieImage from "components/BungieImage";
import { BaseDestinyDefinition } from "types";
import { getDisplayName } from "lib/destinyTsUtils";

interface DefinitionsDataViewProps {
  definition: any;
  tableName: string;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

const DefinitionsDataView: React.FC<DefinitionsDataViewProps> = ({
  definition,
  tableName,
  linkedDefinitionUrl,
}) => {
  const typedDef = definition as BaseDestinyDefinition;

  const displayName = getDisplayName(typedDef) || <em>No name</em>;

  const icon =
    (typedDef.displayProperties &&
      typedDef.displayProperties.hasIcon &&
      typedDef.displayProperties.icon) ||
    typedDef.iconImage;

  return (
    <div>
      <h2>
        {icon && <BungieImage className={s.titleIcon} alt="" src={icon} />}
        {displayName}{" "}
        {typedDef.hash && <code className={s.code}>{typedDef.hash}</code>}{" "}
        <code className={s.code}>{tableName}</code>
      </h2>

      {typedDef.displayProperties && typedDef.displayProperties.description && (
        <p className={s.itemDescription}>
          {typedDef.displayProperties.description}
        </p>
      )}

      <NewDataView
        data={definition}
        schema={getSchemaFromDefinitionName(tableName)}
        linkedDefinitionUrl={linkedDefinitionUrl}
      />
    </div>
  );
};

export default DefinitionsDataView;
