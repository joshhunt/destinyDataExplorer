import React from 'react';
import 'react-tabs/style/react-tabs.css';

import Item from 'src/components/Item';

import s from './styles.styl';

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
              entry={{
                type: 'DestinyInventoryItemDefinition',
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
          <div className={s.section}>
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
                  <div className={s.socket}>
                    <div className={s.socketMain}>
                      <Item
                        pathForItem={pathForItem}
                        className={s.item}
                        entry={{
                          type: 'DestinyInventoryItemDefinition',
                          def: socketItem
                        }}
                      />
                    </div>

                    <div className={s.socketAlts}>
                      {socketEntry.reusablePlugItems
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
                            <Item
                              pathForItem={pathForItem}
                              className={s.item}
                              entry={{
                                type: 'DestinyInventoryItemDefinition',
                                def: reusablePlugItem
                              }}
                            />
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

  if (!(hasGearset || hasSockets)) {
    return null;
  }

  return (
    <div className={s.root}>
      {hasGearset && (
        <GearsetItemList
          item={item}
          definitions={definitions}
          pathForItem={pathForItem}
        />
      )}

      {hasSockets && (
        <Sockets
          item={item}
          definitions={definitions}
          pathForItem={pathForItem}
        />
      )}
    </div>
  );
}
