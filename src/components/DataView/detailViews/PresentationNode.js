import React, { Component } from 'react';
import { flatMapDeep, groupBy, uniqBy } from 'lodash';
import { connect } from 'react-redux';

import { addCollectedItem } from 'src/store/app';

import Item from 'src/components/Item';

import s from './styles.styl';

function deepCollectiblesFromPresentationNodes(node, definitions) {
  if (!node || !node.children) {
    return [];
  }

  return flatMapDeep(node.children.presentationNodes, childNode => {
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
          c =>
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
  addCollectiblesListToCollection
}) {
  const itemsBySource = Object.entries(
    groupBy(
      deepCollectiblesFromPresentationNodes(item, definitions),
      'sourceString'
    )
  )
    .map(([sourceString, items]) => {
      return { sourceString, items: uniqBy(items, c => c.itemHash) };
    })
    .sort((a, b) => (a.sourceString > b.sourceString ? 1 : -1));

  return (
    <div>
      {itemsBySource.map((itemSet, index) => (
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
            {itemSet.items.map(collectible => {
              return (
                <Item
                  pathForItem={pathForItem}
                  className={s.item}
                  entry={{
                    type: 'DestinyCollectibleDefinition',
                    def: collectible,
                    key: collectible.hash
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
              entry={{
                type: childDefinitionType,
                def: child,
                key: child && child.hash
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
    showRecursiveItemSources: false
  };

  toggle = () => {
    this.setState({
      showRecursiveItemSources: !this.state.showRecursiveItemSources
    });
  };

  addCollectiblesListToCollection = collectiblesList => {
    console.log('want to add', `collectiblesList`);

    collectiblesList.forEach(col => {
      console.log(' - ', col);
      if (col.itemHash) {
        console.log('   - yes');
        this.props.addCollectedItem({
          dxId: `DestinyInventoryItemDefinition:${col.itemHash}`,
          type: `DestinyInventoryItemDefinition`,
          key: col.itemHash
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
            {showRecursiveItemSources ? 'Hide' : 'View'} collectibles
            recursively
          </button>
          </p>
        )}

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
