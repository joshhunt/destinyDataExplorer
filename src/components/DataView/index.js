import React, { Component } from "react";

import cx from "classnames";

import DefinitionsDataView from "components/DefinitionsDataView";
import s from "./styles.module.scss";

export default class DataView extends Component {
  rootClick = (ev) => {
    if (ev.target === this.ref) {
      this.props.onRequestClose && this.props.onRequestClose();
    }
  };

  getDefinition = () => {
    const def = { ...this.props.item };
    delete def.$type;
    return def;
  };

  render() {
    const { type, className, depth, pathForItem } = this.props;

    const item = this.getDefinition();

    if (!item) {
      return (
        <div>Item not found. perhaps new definitions are still loading?</div>
      );
    }

    return (
      <div
        className={cx(s.root, className)}
        onClick={this.rootClick}
        ref={(r) => (this.ref = r)}
      >
        <div className={s.data} style={{ left: 100 * depth }}>
          <DefinitionsDataView
            definition={item}
            tableName={type}
            linkedDefinitionUrl={(item) =>
              pathForItem(item.type, { hash: item.hash })
            }
          />
        </div>
      </div>
    );
  }
}
