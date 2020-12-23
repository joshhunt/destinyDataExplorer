import React from "react";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";

import s from "../styles.module.scss";
import { ReduxStore } from "types";
import { useSelector } from "react-redux";
import Item from "components/Item";

interface SocketsProps {
  definition: DestinyInventoryItemDefinition;
}

const Sockets: React.FC<SocketsProps> = ({ definition }) => {
  const definitions = useSelector(
    (store: ReduxStore) => store.definitions.definitions
  );
  const { sockets } = definition;

  if (!sockets || !definitions) {
    return null;
  }

  return (
    <div>
      <h3 className={s.title}>Sockets</h3>

      {sockets.socketCategories.map((socketCategory) => {
        const categoryDef =
          definitions.DestinySocketCategoryDefinition?.[
            socketCategory.socketCategoryHash
          ];

        return (
          <div key={socketCategory.socketCategoryHash} className={s.category}>
            <h4 className={s.cateogryTitle}>
              {categoryDef?.displayProperties.name}
            </h4>

            <div className={s.socketList}>
              {socketCategory.socketIndexes.map((socketIndex) => {
                const socketEntry =
                  definition.sockets?.socketEntries[socketIndex];

                if (!socketEntry) return null;

                const plugSet =
                  socketEntry.randomizedPlugSetHash &&
                  definitions.DestinyPlugSetDefinition?.[
                    socketEntry.randomizedPlugSetHash
                  ]?.reusablePlugItems;

                const plugs = [
                  ...socketEntry.reusablePlugItems,
                  ...(plugSet || []),
                ].filter(
                  (v) => v.plugItemHash !== socketEntry.singleInitialItemHash
                );

                plugs.unshift({
                  plugItemHash: socketEntry.singleInitialItemHash,
                });

                return (
                  <div key={socketIndex} className={s.socket}>
                    {plugs.map(({ plugItemHash }) => {
                      const isMainPlug =
                        plugItemHash === socketEntry.singleInitialItemHash;

                      const plugItemDef =
                        definitions.DestinyInventoryItemDefinition?.[
                          plugItemHash
                        ];

                      return (
                        plugItemDef && (
                          <Item
                            pathForItem={() => ""}
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
