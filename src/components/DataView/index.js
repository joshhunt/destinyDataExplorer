import React, { Component } from 'react';
import { Link } from 'react-router';
import { isString } from 'lodash';
import cx from 'classnames';
import JSONTree from 'react-json-tree';

import BungieImage from 'src/components/BungieImage';
import { getNameForItem, bungieUrl } from 'src/lib/destinyUtils';

import s from './styles.styl';

const isImage = value => isString(value) && value.match(/\.(png|jpg|jpeg)$/);

function ImageValue({ value }) {
  return (
    <a href={bungieUrl(value)} className={s.jsonLinkedValue}>
      <BungieImage className={s.jsonImage} src={value} alt="preview" />
    </a>
  );
}

function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}

export default class DataView extends Component {
  rootClick = ev => {
    if (ev.target === this.ref) {
      this.props.onRequestClose && this.props.onRequestClose();
    }
  };

  valueRenderer = (prettyValue, rawValue, ...itemPath) => {
    if (isImage(rawValue)) {
      return <ImageValue value={rawValue} />;
    }

    const { item, definitionType } =
      this.props.lookupLinkedItem(itemPath, rawValue) || {};

    if (!definitionType) {
      return prettyValue;
    } else if (!item) {
      return (
        <span
          className={s.jsonNonLinkedValue}
        >{`<${definitionType} ${prettyValue}>`}</span>
      );
    }

    const displayName = getNameForItem(item);

    return (
      <Link
        to={this.props.pathForItem(definitionType, item)}
        className={s.jsonLinkedValue}
      >
        {`<${toTitleCase(definitionType)} ${displayName} ${prettyValue}>`}
      </Link>
    );
  };

  render() {
    const { type, item, className, depth } = this.props;
    const displayname = getNameForItem(item, true) || <em>No name</em>;

    return (
      <div
        className={cx(s.root, className)}
        onClick={this.rootClick}
        ref={r => (this.ref = r)}
      >
        <div className={s.data} style={{ left: 100 * depth }}>
          <h2>
            {item.displayProperties &&
              item.displayProperties.hasIcon && (
                <BungieImage
                  className={s.titleIcon}
                  alt=""
                  src={item.displayProperties.icon}
                />
              )}
            {displayname} <code className={s.code}>{item.hash}</code>{' '}
            <code className={s.code}>{type}</code>
          </h2>

          {item.displayProperties &&
            item.displayProperties.description && (
              <p className={s.itemDescription}>
                {item.displayProperties.description}
              </p>
            )}

          <JSONTree data={item} valueRenderer={this.valueRenderer} />
        </div>
      </div>
    );
  }
}
