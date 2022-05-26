import { DestinyRecordDefinition } from "bungie-api-ts/destiny2";
import ObjectiveList from "components/ObjectiveList";
import React from "react";

interface RecordDetailsProps {
  definition: DestinyRecordDefinition;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ definition }) => {
  const normalObjectives = definition.objectiveHashes ?? [];
  const intervalObjectives =
    definition.intervalInfo?.intervalObjectives.map(
      (v) => v.intervalObjectiveHash
    ) ?? [];

  return (
    <>
      {normalObjectives.length > 0 && (
        <>
          <h3>Objectives</h3>
          <ObjectiveList objectiveHashes={normalObjectives} />
        </>
      )}

      {intervalObjectives.length > 0 && (
        <>
          <h3>Interval objectives</h3>
          <ObjectiveList objectiveHashes={intervalObjectives} />
        </>
      )}
    </>
  );
};

export default RecordDetails;

export function displayRecordDetails(tableName: string, definition: any) {
  return (
    tableName === "DestinyRecordDefinition" &&
    (definition.objectiveHashes?.length > 0 ||
      definition.intervalInfo?.intervalObjectives.length > 0)
  );
}
