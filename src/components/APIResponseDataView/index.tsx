import { DefinitionEntry } from "components/DataViewsOverlay/utils";
import RawJSON from "components/DefinitionDataView/RawJSON";
import NewDataView from "components/NewDataView";
import TabButtonList, { TabKind } from "components/TabButtonList";
import { notEmpty } from "lib/utils";
import { OpenAPIV3 } from "openapi-types/dist/index";
import React, { useState } from "react";
import GetPostGameCarnageReport from "./responseViews/GetPostGameCarnageReportView";
import GetPGCR from "./responseViews/GetPostGameCarnageReportView";

interface APIResponseDataViewProps {
  data: any;
  schema?: OpenAPIV3.SchemaObject;
  operationName: string;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

const APIResponseDataView: React.FC<APIResponseDataViewProps> = ({
  data,
  schema,
  operationName,
  linkedDefinitionUrl,
}) => {
  const [activeTab, setActiveTab] = useState(TabKind.Pretty);
  const hasDetails = operationHasDetails(operationName);

  return (
    <div>
      <TabButtonList
        onButtonClick={(tabId) => setActiveTab(tabId)}
        activeTab={activeTab}
        options={[
          [TabKind.Pretty, "Pretty"] as const,
          [TabKind.RawJson, "Raw JSON"] as const,
          hasDetails && ([TabKind.Preview, "Details"] as const),
        ].filter(notEmpty)}
      />

      {activeTab === TabKind.Pretty && (
        <NewDataView
          data={data}
          schema={schema}
          linkedDefinitionUrl={linkedDefinitionUrl}
        />
      )}

      {activeTab === TabKind.RawJson && (
        <RawJSON data={data} limitHeight={false} />
      )}

      {activeTab === TabKind.Preview && (
        <DetailsView operationName={operationName} data={data} />
      )}
    </div>
  );
};

function operationHasDetails(operationName: string) {
  switch (operationName) {
    case "Destiny2.GetPostGameCarnageReport":
      return true;
    default:
      return false;
  }
}

interface DetailsViewProps {
  data: any;
  operationName: string;
}

const DetailsView: React.FC<DetailsViewProps> = ({ data, operationName }) => {
  switch (operationName) {
    case "Destiny2.GetPostGameCarnageReport":
      return <GetPostGameCarnageReport data={data} />;
    default:
      return null;
  }
};

export default APIResponseDataView;
