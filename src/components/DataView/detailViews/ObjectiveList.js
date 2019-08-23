import React from "react";
import { Link } from "react-router";
import { memoize } from "lodash";

import BungieImage from "components/BungieImage";

import s from "./styles.module.scss";

const _withDef = memoize(defs => (itemHash, cb) => cb(defs[itemHash]));

export default function ObjectiveList({
  objectiveHashes,
  definitions,
  pathForItem
}) {
  const withObjectiveDef = _withDef(definitions.DestinyObjectiveDefinition);

  return (
    <ul className={s.boringList}>
      {objectiveHashes.map(objectiveHash =>
        withObjectiveDef(
          objectiveHash,
          objective =>
            objective && (
              <li key={objectiveHash}>
                <Link
                  className={s.boringLink}
                  to={pathForItem("Objective", objective)}
                >
                  <BungieImage
                    src={objective.displayProperties.icon}
                    className={s.inlineIcon}
                  />
                  {objective.progressDescription || objective.hash}
                </Link>
                : {objective.completionValue}
              </li>
            )
        )
      )}
    </ul>
  );
}
