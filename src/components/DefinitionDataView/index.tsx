import React, { Suspense, useState } from "react";

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
import TabButtonList, { TabKind } from "components/TabButtonList";
import { notEmpty } from "lib/utils";
import ComponentLoading from "components/ComponentLoading";
import typeStyles from "styles/typography.module.scss";
import { SelectBreak } from "components/DataView/JsonValueAnnotation";

const NewDataView = React.lazy(() => import("components/DataView"));

interface DefinitionDataViewProps {
  definition: any;
  tableName: string;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

const DefinitionDataView: React.FC<DefinitionDataViewProps> = ({
  definition,
  tableName,
  linkedDefinitionUrl,
}) => {
  const [activeTab, setActiveTab] = useState(TabKind.Pretty);
  const typedDef = definition as BaseDestinyDefinition;
  const hasDetails = displayDefinitionDetails(tableName, definition);

  const displayName = getDisplayName(typedDef) || <em>No name</em>;

  const icon =
    (typedDef.displayProperties &&
      typedDef.displayProperties.hasIcon &&
      typedDef.displayProperties.icon) ||
    typedDef.iconImage;

  const description =
    typedDef.displayProperties?.description || typedDef.flavorText;

  return (
    <div>
      <h2 className={typeStyles.h1}>
        {icon && <BungieImage className={s.titleIcon} alt="" src={icon} />}
        {displayName}
        <SelectBreak />
        {typedDef.hash && <code className={s.code}>{typedDef.hash}</code>}
        <SelectBreak />
        <code className={s.code}>{tableName}</code>
      </h2>

      {description && <p className={s.itemDescription}>{description}</p>}

      <TabButtonList
        onTabChange={(tabId) => setActiveTab(tabId)}
        activeTab={activeTab}
        options={[
          [TabKind.Pretty, "Pretty"] as const,
          [TabKind.RawJson, "Raw JSON"] as const,
          hasDetails && ([TabKind.Preview, "Details"] as const),
        ].filter(notEmpty)}
      />

      {activeTab === TabKind.Pretty && (
        <Suspense fallback={<ComponentLoading />}>
          <NewDataView
            data={definition}
            schema={getSchemaFromDefinitionName(tableName)}
            linkedDefinitionUrl={linkedDefinitionUrl}
          />
        </Suspense>
      )}

      {activeTab === TabKind.RawJson && (
        <RawJSON data={definition} limitHeight={true} />
      )}

      {activeTab === TabKind.Preview && (
        <DefinitionDetails tableName={tableName} definition={definition} />
      )}
    </div>
  );
};

export default DefinitionDataView;
