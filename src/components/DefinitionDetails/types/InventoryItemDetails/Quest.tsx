import React from "react";
import { Link } from "react-router-dom";
import {
  AllDestinyManifestComponents,
  DestinyInventoryItemDefinition,
} from "bungie-api-ts/destiny2";

import { useDefinitionTable } from "lib/destinyTsUtils";
import s from "../styles.module.scss";
import ObjectiveList from "components/ObjectiveList";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import { Subtitle1, Subtitle2 } from "components/Text";

interface QuestProps {
  definition: DestinyInventoryItemDefinition;
}

const Quest: React.FC<QuestProps> = ({ definition }) => {
  const pathForItem = usePathForDefinition();

  const itemDefs =
    (useDefinitionTable(
      "DestinyInventoryItemDefinition"
    ) as AllDestinyManifestComponents["DestinyInventoryItemDefinition"]) ||
    undefined;

  if (!definition || !definition.setData) {
    return null;
  }

  const questStepItems = definition.setData.itemList.map(
    (v) => itemDefs[v.itemHash]
  );

  return (
    <div>
      <Subtitle1>QUEST: {definition.setData.questLineName}</Subtitle1>

      {questStepItems.map((questStepItem, index) => (
        <div
          className={
            questStepItem.hash === definition.hash
              ? s.activeQuestStep
              : s.questStep
          }
        >
          <Subtitle2>
            <Link
              to={pathForItem("DestinyInventoryItemDefinition", questStepItem)}
              className={s.plainLink}
            >
              {index + 1}. {questStepItem.displayProperties.name}
            </Link>
          </Subtitle2>

          <p className={s.questStepDescription}>
            {questStepItem.displayProperties.description}
          </p>

          {definition.objectives && (
            <ObjectiveList
              objectiveHashes={definition.objectives.objectiveHashes}
            />
          )}

          <blockquote className={s.quoteProse}>
            {questStepItem.displaySource}
          </blockquote>
        </div>
      ))}
    </div>
  );
};

export default Quest;
