import React from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import s from "../styles.module.scss";
import ObjectiveList from "components/ObjectiveList";
import { Subtitle1 } from "components/Text";

interface ObjectivesProps {
  definition: DestinyInventoryItemDefinition;
}

const Objectives: React.FC<ObjectivesProps> = ({ definition }) => {
  const { objectives } = definition;
  if (!objectives) return null;

  return (
    <div className={s.containWidth}>
      <Subtitle1>Objectives</Subtitle1>
      <ObjectiveList objectiveHashes={objectives.objectiveHashes} />
    </div>
  );
};

export default Objectives;
