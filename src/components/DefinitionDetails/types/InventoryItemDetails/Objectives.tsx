import React from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import s from "../styles.module.scss";
import { useSelector } from "react-redux";
import { ReduxStore } from "types";

interface ObjectivesProps {
  definition: DestinyInventoryItemDefinition;
}

const Objectives: React.FC<ObjectivesProps> = ({ definition }) => {
  const definitions = useSelector(
    (store: ReduxStore) => store.definitions.definitions
  );

  const { objectives } = definition;
  if (!objectives) return null;

  return (
    <div>
      <h3 className={s.title}>Objectives</h3>

      {objectives.objectiveHashes.map((objectiveHash) => {
        const objectiveDef =
          definitions?.DestinyObjectiveDefinition?.[objectiveHash];

        return objectiveDef ? (
          <span key={objectiveHash}>
            {objectiveDef.progressDescription}: {objectiveDef.completionValue}
          </span>
        ) : (
          <em key={objectiveHash}>{objectiveHash}</em>
        );
      })}
    </div>
  );
};

export default Objectives;
