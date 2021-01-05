import { notEmpty } from "lib/utils";
import React from "react";
import { useSelector } from "react-redux";
import { ReduxStore } from "types";

interface ObjectiveListProps {
  objectiveHashes: number[];
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
    <div>
      {objectives.map((objectiveDef, index) => {
        return (
          <div key={index}>
            {objectiveDef.progressDescription ||
              objectiveDef.displayProperties.name || <em>No name</em>}
            : {objectiveDef.completionValue}
          </div>
        );
      })}
    </div>
  );
};

export default ObjectiveList;
