import { DestinyObjectiveDefinition } from "bungie-api-ts/destiny2";
import { notEmpty } from "lib/utils";
import React from "react";
import { useSelector } from "react-redux";
import { ReduxStore } from "types";

import s from "./styles.module.scss";

interface ObjectiveListProps {
  objectiveHashes: number[];
}

enum DestinyUnlockValueUIStyle {
  Automatic = 0,
  Fraction = 1,
  Checkbox = 2,
  Percentage = 3,
  DateTime = 4,
  FractionFloat = 5,
  Integer = 6,
  TimeDuration = 7,
  Hidden = 8,
  Multiplier = 9,
  GreenPips = 10,
  RedPips = 11,
  ExplicitPercentage = 12,
  RawFloat = 13,
}

function isBooleanObjective(objectiveDef: DestinyObjectiveDefinition) {
  return (
    ((objectiveDef.valueStyle as unknown) as DestinyUnlockValueUIStyle) ===
      DestinyUnlockValueUIStyle.Checkbox ||
    (objectiveDef.completionValue === 1 &&
      (!objectiveDef.allowOvercompletion || !objectiveDef.showValueOnComplete))
  );
}

const ObjectiveList: React.FC<ObjectiveListProps> = ({ objectiveHashes }) => {
  const objectives = useSelector((state: ReduxStore) => {
    return objectiveHashes
      .map(
        (hash) =>
          state.definitions.definitions?.DestinyObjectiveDefinition?.[hash]
      )
      .filter(notEmpty);
  });

  return (
    <div className={s.root}>
      {objectives.map((objectiveDef, index) => {
        return (
          <div className={s.objective} key={index}>
            <div className={s.label}>
              {objectiveDef.progressDescription ||
                objectiveDef.displayProperties.name || <em>No name</em>}
            </div>

            <div className={s.completionValue}>
              {isBooleanObjective(objectiveDef) ? (
                <input type="checkbox" disabled />
              ) : (
                objectiveDef.completionValue
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ObjectiveList;
