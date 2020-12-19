import React, { Component, useState, useEffect } from "react";
import { flatMapDeep, groupBy, uniqBy } from "lodash";
import { connect } from "react-redux";

import { addCollectedItem } from "store/app";

import Item from "components/Item";

import s from "./styles.module.scss";

function deepCollectiblesFromPresentationNodes(node, definitions) {
  if (!node || !node.children) {
    return [];
  }

  return flatMapDeep(node.children.presentationNodes, (childNode) => {
    const childPresentationNode =
      definitions.DestinyPresentationNodeDefinition[
        childNode.presentationNodeHash
      ];

    if (
      childPresentationNode &&
      childPresentationNode.children &&
      childPresentationNode.children.collectibles &&
      childPresentationNode.children.collectibles.length
    ) {
      return childPresentationNode.children.collectibles
        .map(
          (c) =>
            definitions.DestinyCollectibleDefinition &&
            definitions.DestinyCollectibleDefinition[c.collectibleHash]
        )
        .filter(Boolean);
    }

    return deepCollectiblesFromPresentationNodes(
      childPresentationNode,
      definitions
    );
  });
}

function RecursiveItemsBySource({
  item,
  definitions,
  pathForItem,
  addCollectiblesListToCollection,
}) {
  const [newSourceStrings, setNewSourceStrings] = useState([]);
  const [showOnlyNew, setShowOnlyNew] = useState(true);

  useEffect(() => {
    fetch(
      "https://s3.amazonaws.com/destiny.plumbing/en/diff/collectibleSourceStrings.json"
    )
      .then((r) => r.json())
      .then((data) => {
        setNewSourceStrings(data.new);
      });
  }, []);

  const itemsBySource = Object.entries(
    groupBy(
      deepCollectiblesFromPresentationNodes(item, definitions),
      "sourceString"
    )
  )
    .map(([sourceString, items]) => {
      return { sourceString, items: uniqBy(items, (c) => c.itemHash) };
    })
    // .filter(({ sourceString }) => sourceString.includes('Nightfall'))
    .sort((a, b) => (a.sourceString > b.sourceString ? 1 : -1));

  return (
    <div>
      <button onClick={() => setShowOnlyNew(!showOnlyNew)} className={s.button}>
        {showOnlyNew ? "Show all sources" : "Show only new sources"}
      </button>
      <br />

      {itemsBySource
        .filter((itemSet) => {
          if (showOnlyNew) {
            return (
              itemSet.sourceString &&
              newSourceStrings.includes(itemSet.sourceString)
            );
          } else {
            return true;
          }
        })
        .map((itemSet, index) => (
          <div className={s.section} key={index}>
            <div className={s.sectionTitle}>
              {itemSet.sourceString.length > 1 ? (
                itemSet.sourceString
              ) : (
                <em>Unknown source</em>
              )}

              <button
                className={s.smallButton}
                onClick={() => addCollectiblesListToCollection(itemSet.items)}
              >
                Add items to collection
              </button>
            </div>

            <div className={s.itemList}>
              {itemSet.items.map((collectible) => {
                return (
                  <Item
                    pathForItem={pathForItem}
                    className={s.item}
                    entry={{
                      type: "DestinyCollectibleDefinition",
                      def: collectible,
                      key: collectible.hash,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}

function Children({ items, definitions, childDefinitionType, pathForItem }) {
  if (items.length < 1) {
    return null;
  }

  return (
    <div className={s.section}>
      <div className={s.sectionTitle}>PresentationNodes</div>
      <div className={s.sectionItemList}>
        {items.map(({ presentationNodeHash, collectibleHash, recordHash }) => {
          const hash = collectibleHash || presentationNodeHash || recordHash;
          const defs = definitions[childDefinitionType];
          const child = defs && defs[hash];

          return (
            <Item
              pathForItem={pathForItem}
              className={s.item}
              key={hash}
              entry={{
                type: childDefinitionType,
                def: child,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

class PresentationNode extends Component {
  state = {
    showRecursiveItemSources: false,
  };

  toggle = () => {
    this.setState({
      showRecursiveItemSources: !this.state.showRecursiveItemSources,
    });
  };

  addCollectiblesListToCollection = (collectiblesList) => {
    collectiblesList.forEach((col) => {
      if (col.itemHash) {
        this.props.addCollectedItem({
          dxId: `DestinyInventoryItemDefinition:${col.itemHash}`,
          type: `DestinyInventoryItemDefinition`,
          key: col.itemHash,
          forceName: col.displayProperties && col.displayProperties.name,
        });
      }
    });
  };

  render() {
    const { item, definitions, pathForItem } = this.props;
    const { showRecursiveItemSources } = this.state;

    return (
      <div>
        {definitions.DestinyCollectibleDefinition && (
          <p>
            <button onClick={this.toggle} className={s.button}>
              {showRecursiveItemSources ? "Hide" : "View"} collectibles
              recursively
            </button>
          </p>
        )}

        {item.children && (
          <div>
            <Children
              items={item.children.presentationNodes}
              childDefinitionType="DestinyPresentationNodeDefinition"
              definitions={definitions}
              pathForItem={pathForItem}
            />

            <Children
              items={item.children.collectibles}
              childDefinitionType="DestinyCollectibleDefinition"
              definitions={definitions}
              pathForItem={pathForItem}
            />

            <Children
              items={item.children.records}
              childDefinitionType="DestinyRecordDefinition"
              definitions={definitions}
              pathForItem={pathForItem}
            />
          </div>
        )}
        {showRecursiveItemSources && (
          <RecursiveItemsBySource
            {...{ item, definitions, pathForItem }}
            addCollectiblesListToCollection={
              this.addCollectiblesListToCollection
            }
          />
        )}
      </div>
    );
  }
}

export default connect(null, { addCollectedItem })(PresentationNode);
