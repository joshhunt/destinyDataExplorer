import React, { Component, Fragment } from "react";
import { memoize } from "lodash";
import { Link } from "react-router";

import Item from "components/Item";
import ObjectiveList from "./ObjectiveList";

import s from "./styles.module.scss";

const _withDef = memoize((defs) => (itemHash, cb) => cb(defs[itemHash]));

class Toggleable extends Component {
  state = {
    visible: false,
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
          {buttonTitle || "Toggle"}
        </button>
        {visible && children}
      </Fragment>
    );
  }
}

export default function Questline(props) {
  return (
    <Toggleable
      buttonTitle={`View Questline - ${props.item.setData.itemList.length} steps`}
    >
      <QuestlineBody {...props} />
    </Toggleable>
  );
}

function QuestlineBody({ item, definitions, pathForItem }) {
  const withItemDef = _withDef(definitions.DestinyInventoryItemDefinition);

  return (
    <div className={s.section}>
      <br />
      {item.setData.itemList.map((listItem, index) =>
        withItemDef(listItem.itemHash, (def) => (
          <div key={`${listItem.itemHash}${index}`} className={s.section}>
            <div className={s.sectionTitle}>
              <strong>
                {index + 1}.{" "}
                <Link
                  className={s.boringLink}
                  to={pathForItem("InventoryItem", def)}
                >
                  {def.displayProperties.name}
                </Link>
              </strong>
            </div>

            <div className={s.small}>
              <div className={s.description}>
                {def.displayProperties.description}
              </div>

              {def.objectives && def.objectives.objectiveHashes && (
                <Fragment>
                  <div>
                    <br />
                    <strong>Objectives:</strong>
                  </div>

                  <ObjectiveList
                    objectiveHashes={def.objectives.objectiveHashes}
                    definitions={definitions}
                    pathForItem={pathForItem}
                  />
                </Fragment>
              )}
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
          type: "DestinyInventoryItemDefinition",
          def: parentQuestItem,
        }}
      />
    </Fragment>
  );
}
