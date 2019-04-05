import React, { Component } from "react";
import { Link } from "react-router";
import { isString, memoize, get } from "lodash";
import cx from "classnames";
import JSONTree from "react-json-tree";

import BungieImage from "src/components/BungieImage";
import { getNameForItem, bungieUrl } from "src/lib/destinyUtils";
import copyToClipboard from "src/lib/copyToClipboard";

import Vendor from "./detailViews/Vendor";
import InventoryItem from "./detailViews/InventoryItem";
import PresentationNode from "./detailViews/PresentationNode";
import AnyObjectives from "./detailViews/AnyObjectives";

import specialValueOverrides from "./specialValueOverrides";
import s from "./styles.styl";

const DETAIL_VIEWS = {
  DestinyVendorDefinition: Vendor,
  DestinyInventoryItemDefinition: InventoryItem,
  DestinyPresentationNodeDefinition: PresentationNode
};

const stringifyJSON = memoize(obj => JSON.stringify(obj, null, 2));

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
  state = {
    rawJSON: false,
    textAreaHeight: 1
  };

  rootClick = ev => {
    if (ev.target === this.ref) {
      this.props.onRequestClose && this.props.onRequestClose();
    }
  };

  valueRenderer = (prettyValue, rawValue, ...itemPath) => {
    if (isImage(rawValue)) {
      return <ImageValue value={rawValue} />;
    }

    const overrideFn = specialValueOverrides[itemPath[0]];
    if (overrideFn) {
      const specialValue = overrideFn(
        prettyValue,
        rawValue,
        itemPath,
        this.props.item,
        this.props.definitions
      );

      if (specialValue) {
        return specialValue;
      }
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

  toggleRawJSON = () => {
    this.setState({
      rawJSON: !this.state.rawJSON
    });
  };

  getTextareaRef = ref => {
    if (ref) {
      setTimeout(() => {
        this.setState({
          textAreaHeight: ref.scrollHeight + 2
        });
      }, 1);
    }
  };

  copyJSON = () => {
    copyToClipboard(stringifyJSON(this.props.item));
  };

  render() {
    const {
      type,
      item,
      className,
      depth,
      definitions,
      pathForItem
    } = this.props;

    const { rawJSON, textAreaHeight } = this.state;

    const displayname = getNameForItem(item, true) || <em>No name</em>;
    const isPerk = !!item.plug;

    const DetailView = DETAIL_VIEWS[type];

    const icon =
      (item.displayProperties &&
        item.displayProperties.hasIcon &&
        item.displayProperties.icon) ||
      item.iconImage;

    return (
      <div
        className={cx(s.root, className)}
        onClick={this.rootClick}
        ref={r => (this.ref = r)}
      >
        <div className={s.data} style={{ left: 100 * depth }}>
          <h2>
            {icon && <BungieImage className={s.titleIcon} alt="" src={icon} />}
            {displayname}{" "}
            {item.hash && <code className={s.code}>{item.hash}</code>}{" "}
            <code className={s.code}>{type}</code>
            {isPerk && <code className={s.code}>Perk</code>}
          </h2>

          {item.displayProperties && item.displayProperties.description && (
            <p className={s.itemDescription}>
              {item.displayProperties.description}
            </p>
          )}

          {DetailView && (
            <DetailView
              item={item}
              definitions={definitions}
              pathForItem={pathForItem}
            />
          )}

          <AnyObjectives
            item={item}
            definitions={definitions}
            pathForItem={pathForItem}
          />

          {rawJSON ? (
            <div>
              <textarea
                style={{ height: textAreaHeight }}
                ref={this.getTextareaRef}
                className={s.rawJsonTextarea}
                value={stringifyJSON(item)}
                readOnly
              />
            </div>
          ) : (
            <div className={s.jsonParent}>
              <JSONTree
                data={item}
                valueRenderer={this.valueRenderer}
                style={{ background: "red" }}
              />
            </div>
          )}

          <button className={s.button} onClick={this.toggleRawJSON}>
            View raw JSON
          </button>
          <button className={s.button} onClick={this.copyJSON}>
            Copy JSON
          </button>
        </div>
      </div>
    );
  }
}
