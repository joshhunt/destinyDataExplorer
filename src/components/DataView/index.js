import React, { Component } from 'react';
import cx from 'classnames';

import s from './styles.styl';

export default class DataView extends Component {
  render() {
    const { type, item, className, depth } = this.props;

    return (
      <div className={cx(s.root, className)}>
        <div className={s.data} style={{ left: 100 * depth }}>
          <h2>{type}</h2>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </div>
      </div>
    );
  }
}
