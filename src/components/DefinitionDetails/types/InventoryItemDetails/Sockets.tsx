import React from "react";
import {
  DestinyInventoryItemDefinition,
  DestinyItemSocketCategoryDefinition,
} from "bungie-api-ts/destiny2";

import s from "../styles.module.scss";
import { ReduxState } from "types";
import { useSelector } from "react-redux";
import Item from "components/Item";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import { Subtitle1, Subtitle2 } from "components/Text";

interface SocketsProps {
  definition: DestinyInventoryItemDefinition;
}

const Sockets: React.FC<SocketsProps> = ({ definition }) => {
  const pathForItem = usePathForDefinition();

  const definitions = useSelector(
    (store: ReduxState) => store.definitions.definitions
  );
  const { sockets } = definition;

  if (!sockets || !definitions) {
    return null;
  }

  const socketCategories: DestinyItemSocketCategoryDefinition[] =
    sockets.socketCategories ?? [
      {
        socketCategoryHash: 0,
        socketIndexes: definition.sockets?.socketEntries.map(
          (v, index) => index
        ),
      },
    ];

  return (
    <div>
      <Subtitle1>Sockets</Subtitle1>

      {socketCategories.map((socketCategory) => {
        const categoryDef =
          definitions.DestinySocketCategoryDefinition?.[
            socketCategory.socketCategoryHash
          ];

        return (
          <div key={socketCategory.socketCategoryHash} className={s.category}>
            <Subtitle2>
              {categoryDef?.displayProperties.name ?? <em>Unknown category</em>}
            </Subtitle2>

            <div className={s.socketList}>
              {socketCategory.socketIndexes.map((socketIndex) => {
                const socketEntry =
                  definition.sockets?.socketEntries[socketIndex];

                if (!socketEntry) return null;

                const randomPlugSet =
                  socketEntry.randomizedPlugSetHash &&
                  definitions.DestinyPlugSetDefinition?.[
                    socketEntry.randomizedPlugSetHash
                  ]?.reusablePlugItems;

                const reusablePlugSet =
                  socketEntry.reusablePlugSetHash &&
                  definitions.DestinyPlugSetDefinition?.[
                    socketEntry.reusablePlugSetHash
                  ]?.reusablePlugItems;

                const reusablePlugs = [
                  ...(socketEntry.reusablePlugItems ?? []),
                  // ...(randomPlugSet || []),
                  ...(reusablePlugSet || []),
                ].filter(
                  (v) => v.plugItemHash !== socketEntry.singleInitialItemHash
                );

                const randomPlugs = (randomPlugSet || []).filter(
                  (v) => v.plugItemHash !== socketEntry.singleInitialItemHash
                );

                reusablePlugs.unshift({
                  plugItemHash: socketEntry.singleInitialItemHash,
                });

                return (
                  <div key={socketIndex} className={s.socket}>
                    {reusablePlugs.map(({ plugItemHash }) => {
                      const isMainPlug =
                        plugItemHash === socketEntry.singleInitialItemHash;

                      const plugItemDef =
                        definitions.DestinyInventoryItemDefinition?.[
                          plugItemHash
                        ];

                      return (
                        plugItemDef && (
                          <Item
                            pathForItem={pathForItem}
                            className={isMainPlug ? s.plug : s.altPlug}
                            key={plugItemHash}
                            isCollected={false}
                            onClick={() => {}}
                            entry={{
                              type: "DestinyInventoryItemDefinition",
                              def: plugItemDef,
                            }}
                          />
                        )
                      );
                    })}

                    {randomPlugs.length > 0 && (
                      <div className={s.randomPlugsHeader}>
                        Randomly one of:
                      </div>
                    )}
                    {randomPlugs.map(({ plugItemHash }) => {
                      const isMainPlug =
                        plugItemHash === socketEntry.singleInitialItemHash;

                      const plugItemDef =
                        definitions.DestinyInventoryItemDefinition?.[
                          plugItemHash
                        ];

                      return (
                        plugItemDef && (
                          <Item
                            pathForItem={pathForItem}
                            className={isMainPlug ? s.plug : s.altPlug}
                            key={plugItemHash}
                            isCollected={false}
                            onClick={() => {}}
                            entry={{
                              type: "DestinyInventoryItemDefinition",
                              def: plugItemDef,
                            }}
                          />
                        )
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Sockets;
