import React, { Component } from 'react';
import cx from 'classnames';
import JSONTree from 'react-json-tree';

import s from './styles.styl';

export default class DataView extends Component {
  rootClick = ev => {
    if (ev.target === this.ref) {
      console.log('close it');
      this.props.onRequestClose && this.props.onRequestClose();
    }
  };

  render() {
    const { type, item, className, depth } = this.props;

    return (
      <div
        className={cx(s.root, className)}
        onClick={this.rootClick}
        ref={r => (this.ref = r)}
      >
        <div className={s.data} style={{ left: 100 * depth }}>
          <h2>{type}</h2>
          <JSONTree data={item} />
        </div>
      </div>
    );
  }
}
