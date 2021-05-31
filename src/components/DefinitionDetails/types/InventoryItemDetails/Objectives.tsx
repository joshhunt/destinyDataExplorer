import React from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import s from "../styles.module.scss";
import ObjectiveList from "components/ObjectiveList";

interface ObjectivesProps {
  definition: DestinyInventoryItemDefinition;
}

const Objectives: React.FC<ObjectivesProps> = ({ definition }) => {
  const { objectives } = definition;
  if (!objectives) return null;

  return (
    <div className={s.containWidth}>
      <h3 className={s.title}>Objectives</h3>

      <ObjectiveList objectiveHashes={objectives.objectiveHashes} />
    </div>
  );
};

export default Objectives;
