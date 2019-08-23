import React from "react";
import { get } from "lodash";

import ObjectiveList from "./ObjectiveList";

import s from "./styles.module.scss";

function WrappedObjectiveList({
  title,
  definitions,
  pathForItem,
  objectiveHashes
}) {
  console.log("WrappedObjectiveList objectiveHashes", objectiveHashes);

  return (
    objectiveHashes &&
    objectiveHashes.length > 0 && (
      <div className={s.section}>
        <div className={s.sectionTitle}>{title}</div>

        <ObjectiveList
          objectiveHashes={objectiveHashes}
          definitions={definitions}
          pathForItem={pathForItem}
        />
      </div>
    )
  );
}

export default function AnyObjectives({ item, definitions, pathForItem }) {
  const objectiveHashes = [
    ...get(item, "objectives.objectiveHashes", []),
    ...get(item, "objectiveHashes", [])
  ];

  const emblemObjective = item.emblemObjectiveHash;

  if (!(emblemObjective || objectiveHashes.length)) {
    return null;
  }

  return (
    <div className={s.root}>
      <WrappedObjectiveList
        title="Emblem tracks:"
        objectiveHashes={[emblemObjective].filter(Boolean)}
        definitions={definitions}
        pathForItem={pathForItem}
      />

      <WrappedObjectiveList
        title="Objectives:"
        objectiveHashes={objectiveHashes}
        definitions={definitions}
        pathForItem={pathForItem}
      />
    </div>
  );
}
