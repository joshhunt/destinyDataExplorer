import React, { Component, Fragment } from 'react';
import { memoize } from 'lodash';
import { Link } from 'react-router';

import Item from 'src/components/Item';

import s from './styles.styl';

const _withDef = memoize(defs => (itemHash, cb) => cb(defs[itemHash]));

class Toggleable extends Component {
  state = {
    visible: false
  };

  toggle = () => {
    this.setState({ visible: !this.state.visible });
  };

  render() {
    const { buttonTitle, children } = this.props;
    const { visible } = this.state;

    return (
      <Fragment>
        <button
          className={visible ? s.toggleButtonActive : s.toggleButton}
          onClick={this.toggle}
        >
          {buttonTitle || 'Toggle'}
        </button>
        {visible && children}
      </Fragment>
    );
  }
}

export default function Questline(props) {
  return (
    <Toggleable
      buttonTitle={`View Questline - ${
        props.item.setData.itemList.length
      } steps`}
    >
      <QuestlineBody {...props} />
    </Toggleable>
  );
}

function QuestlineBody({ item, definitions, pathForItem }) {
  const withItemDef = _withDef(definitions.DestinyInventoryItemDefinition);
  const withObjectiveDef = _withDef(definitions.DestinyObjectiveDefinition);

  return (
    <div className={s.section}>
      <br />
      {item.setData.itemList.map((listItem, index) =>
        withItemDef(listItem.itemHash, def => (
          <div className={s.section}>
            <div key={listItem.trackingValue} className={s.sectionTitle}>
              <strong>
                {index + 1}.{' '}
                <Link
                  className={s.boringLink}
                  to={pathForItem('InventoryItem', def)}
                >
                  {def.displayProperties.name}
                </Link>
              </strong>
            </div>

            <div className={s.small}>
              <div className={s.description}>
                {def.displayProperties.description}
              </div>

              <div>
                <br />
                <strong>Objectives:</strong>
              </div>

              <ul className={s.boringList}>
                {def.objectives.objectiveHashes.map(objectiveHash =>
                  withObjectiveDef(objectiveHash, objective => (
                    <li key={objectiveHash}>
                      <Link
                        className={s.boringLink}
                        to={pathForItem('Objective', objective)}
                      >
                        {objective.progressDescription || objective.hash}
                      </Link>
                      : {objective.completionValue}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function ViewParentQuestline({ item, definitions, pathForItem }) {
  const parentQuestItem =
    definitions.DestinyInventoryItemDefinition[
      item.objectives.questlineItemHash
    ];

  return (
    <Fragment>
      <h4 className={s.title}>From questline:</h4>
      <Item
        pathForItem={pathForItem}
        className={s.item}
        entry={{
          type: 'DestinyInventoryItemDefinition',
          def: parentQuestItem,
          key: parentQuestItem.hash
        }}
      />
    </Fragment>
  );
}
