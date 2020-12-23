import React, { useState } from "react";
import cx from "classnames";

import NewDataView from "components/NewDataView";
import { getSchemaFromDefinitionName } from "lib/apiSchemaUtils";
import { DefinitionEntry } from "components/DataViewsOverlay";
import BungieImage from "components/BungieImage";
import { BaseDestinyDefinition } from "types";
import { getDisplayName } from "lib/destinyTsUtils";
import s from "./styles.module.scss";
import RawJSON from "./RawJSON";
import DefinitionDetails, {
  displayDefinitionDetails,
} from "components/DefinitionDetails";
import { type } from "os";

interface DefinitionDataViewProps {
  definition: any;
  tableName: string;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

enum Tabs {
  Pretty,
  RawJson,
  Preview,
}

const DefinitionDataView: React.FC<DefinitionDataViewProps> = ({
  definition,
  tableName,
  linkedDefinitionUrl,
}) => {
  const [activeTab, setActiveTab] = useState(Tabs.Pretty);
  const typedDef = definition as BaseDestinyDefinition;
  const hasDetails = displayDefinitionDetails(tableName, definition);

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

      <div className={s.tabList}>
        <button
          className={cx(s.tab, activeTab === Tabs.Pretty && s.active)}
          onClick={() => setActiveTab(Tabs.Pretty)}
        >
          Pretty
        </button>
        <button
          className={cx(s.tab, activeTab === Tabs.RawJson && s.active)}
          onClick={() => setActiveTab(Tabs.RawJson)}
        >
          Raw JSON
        </button>
        {hasDetails && (
          <button
            className={cx(s.tab, activeTab === Tabs.Preview && s.active)}
            onClick={() => setActiveTab(Tabs.Preview)}
          >
            Details
          </button>
        )}
      </div>

      {activeTab === Tabs.Pretty && (
        <NewDataView
          data={definition}
          schema={getSchemaFromDefinitionName(tableName)}
          linkedDefinitionUrl={linkedDefinitionUrl}
        />
      )}

      {activeTab === Tabs.RawJson && <RawJSON data={definition} />}

      {activeTab === Tabs.Preview && (
        <DefinitionDetails tableName={tableName} definition={definition} />
      )}
    </div>
  );
};

export default DefinitionDataView;
