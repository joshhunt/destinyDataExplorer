import React from "react";
import "react-tabs/style/react-tabs.scss";

import Item from "components/Item";
import Questline, { ViewParentQuestline } from "./InventoryItemQuestline";

import s from "./styles.module.scss";

function GearsetItemList({ item, definitions, pathForItem }) {
  return (
    <div className={s.section}>
      <div className={s.sectionTitle}>gearset itemList</div>

      <div className={s.sectionItemList}>
        {item.gearset.itemList.map(itemIndex => {
          const gearSetItem =
            definitions.DestinyInventoryItemDefinition[itemIndex];

          return (
            <Item
              pathForItem={pathForItem}
              className={s.item}
              key={gearSetItem.hash}
              entry={{
                type: "DestinyInventoryItemDefinition",
                def: gearSetItem
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Sockets({ item, definitions, pathForItem }) {
  return (
    <div>
      <h3 className={s.title}>Sockets</h3>

      {item.sockets.socketCategories.map(socketCategory => {
        const socketCategoryDef =
          definitions.DestinySocketCategoryDefinition[
            socketCategory.socketCategoryHash
          ];

        return (
          <div key={socketCategory.socketCategoryHash} className={s.inlineSection}>
            <div className={s.sectionTitle}>
              {socketCategoryDef.displayProperties.name}
            </div>

            <div className={s.sectionItemList}>
              {socketCategory.socketIndexes.map(index => {
                const socketEntry = item.sockets.socketEntries[index];
                const socketItem =
                  definitions.DestinyInventoryItemDefinition[
                    socketEntry.singleInitialItemHash
                  ];

                return (
                  <div key={socketEntry.singleInitialItemHash} className={s.socket}>
                    <div className={s.socketMain}>
                      {socketItem && (
                        <Item
                          pathForItem={pathForItem}
                          className={s.item}
                          entry={{
                            type: "DestinyInventoryItemDefinition",
                            def: socketItem,
                          }}
                        />
                      )}
                    </div>

                    <div className={s.socketAlts}>
                      {[
                        ...socketEntry.reusablePlugItems,
                        ...socketEntry.randomizedPlugItems
                      ]
                        .filter(
                          h =>
                            h.plugItemHash !== socketEntry.singleInitialItemHash
                        )
                        .map(hash => {
                          const reusablePlugItem =
                            definitions.DestinyInventoryItemDefinition[
                              hash.plugItemHash
                            ];

                          if (!reusablePlugItem) {
                            debugger;
                          }

                          return (
                            reusablePlugItem && (
                              <Item
                                pathForItem={pathForItem}
                                className={s.item}
                                key={hash.plugItemHash}
                                entry={{
                                  type: "DestinyInventoryItemDefinition",
                                  def: reusablePlugItem,
                                }}
                              />
                            )
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InventoryItem({ item, definitions, pathForItem }) {
  const hasGearset = item.gearset && item.gearset.itemList.length > 0;
  const hasSockets = !!item.sockets;
  const isQuestline = item.setData && item.setData.setType === "quest_global";
  console.log({ isQuestline, item });

  const views = [
    hasGearset && GearsetItemList,
    hasSockets && Sockets,
    isQuestline && Questline,
    item.objectives && item.objectives.questlineItemHash && ViewParentQuestline
  ].filter(Boolean);

  if (!views.length) {
    return null;
  }

  return (
    <div className={s.root}>
      {views.map((View, index) => (
        <View
          key={index}
          item={item}
          definitions={definitions}
          pathForItem={pathForItem}
        />
      ))}
    </div>
  );
}
