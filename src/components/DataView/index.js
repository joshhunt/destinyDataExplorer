import React, { Fragment, Component } from "react";
import { Link } from "react-router";
import { isString, memoize } from "lodash";
import cx from "classnames";
import JSONTree from "react-json-tree";

import { makeTypeShort } from "lib/destinyUtils";
import BungieImage from "components/BungieImage";
import { getNameForItem, bungieUrl } from "lib/destinyUtils";
import copyToClipboard from "lib/copyToClipboard";

import Vendor from "./detailViews/Vendor";
import InventoryItem from "./detailViews/InventoryItem";
import PresentationNode from "./detailViews/PresentationNode";
import AnyObjectives from "./detailViews/AnyObjectives";

import specialValueOverrides from "./specialValueOverrides";
import s from "./styles.module.scss";

import apispec from "./apispec.json";

window.__apispec = apispec;

const RE = /Destiny(\w+)Definition/;

const SPEC_DEBUG = !!window.localStorage.getItem("specdebug");

const definitionNameFromRef = ref => {
  const segments = ref.split(".");
  const lastSegment = segments[segments.length - 1];
  const match = lastSegment.match(RE);
  return match && match[0];
};

function Decorate({ spec, children }) {
  if (!spec || !SPEC_DEBUG) {
    return children;
  }

  const mapped = spec["x-mapped-definition"];
  const mappedRef = mapped && mapped.$ref;
  const mappedTableName = mappedRef && definitionNameFromRef(mappedRef);

  return (
    <Fragment>
      {children}
      <button onClick={() => console.log(spec)} className={s.debugButton}>
        {mappedTableName && <span>{mappedTableName} - </span>} log spec
      </button>
    </Fragment>
  );
}

Object.keys(apispec.definitions).forEach(key => {
  const tableName = definitionNameFromRef(key);
  if (tableName) {
    apispec.definitions[tableName] = apispec.definitions[key];
  }
});

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

    const currentDefinitionType = this.props.type;

    const currentSpec = specForPropertyPath(currentDefinitionType, itemPath);

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

    const enumDef = findEnumValue(currentDefinitionType, itemPath, rawValue);

    if (enumDef) {
      return (
        <Decorate spec={currentSpec}>{`<enum "${
          enumDef.identifier
        }" ${prettyValue}>`}</Decorate>
      );
    }

    const { item, definitionType } =
      lookupLinkedItemWithSpec(
        currentDefinitionType,
        itemPath,
        rawValue,
        this.props.definitions
      ) || {};

    if (!definitionType) {
      return <Decorate spec={currentSpec}>{prettyValue}</Decorate>;
    } else if (!item) {
      return (
        <Decorate spec={currentSpec}>
          <span
            className={s.jsonNonLinkedValue}
          >{`<${definitionType} ${prettyValue}>`}</span>
        </Decorate>
      );
    }

    const displayName = getNameForItem(item);

    return (
      <Decorate spec={currentSpec}>
        <Link
          to={this.props.pathForItem(definitionType, item)}
          className={s.jsonLinkedValue}
        >
          {`<${toTitleCase(definitionType)} ${displayName} ${prettyValue}>`}
        </Link>
      </Decorate>
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

    if (!item) {
      return (
        <div>Item not found. perhaps new definitions are still loading?</div>
      );
    }

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

function specForPropertyPath(currentDefinitionType, itemPath) {
  let currentSpec = apispec.definitions[currentDefinitionType];

  if (!currentSpec) {
    return null;
  }

  const helpfulPath = [...itemPath];
  helpfulPath.reverse();
  helpfulPath.shift();

  helpfulPath.forEach(pathElement => {
    const potentialNewSpec =
      currentSpec.properties && currentSpec.properties[pathElement];

    currentSpec = potentialNewSpec || currentSpec;

    if (!currentSpec) {
      return;
    }

    const ref =
      currentSpec.$ref ||
      (currentSpec.allOf && currentSpec.allOf[0].$ref) ||
      (currentSpec.additionalProperties &&
        currentSpec.additionalProperties.$ref) ||
      (currentSpec.items && currentSpec.items.$ref);

    if (ref) {
      const [, keyA, keyB] = ref.split("/");
      currentSpec = apispec[keyA][keyB];
    }
  });

  return currentSpec;
}

function linkedDefinitionTableName(currentDefinitionType, itemPath) {
  const spec = specForPropertyPath(currentDefinitionType, itemPath);
  const mapped = spec && spec["x-mapped-definition"];
  const mappedRef = mapped && mapped.$ref;
  return mappedRef && definitionNameFromRef(mappedRef);
}

function lookupLinkedItemWithSpec(
  currentDefinitionType,
  itemPath,
  rawValue,
  definitions
) {
  const linkedTableName = linkedDefinitionTableName(
    currentDefinitionType,
    itemPath
  );

  const linkedItem =
    linkedTableName &&
    definitions[linkedTableName] &&
    definitions[linkedTableName][rawValue];

  if (!linkedItem) {
    return null;
  }

  return { item: linkedItem, definitionType: makeTypeShort(linkedTableName) };
}

function findEnumValue(currentDefinitionType, itemPath, enumValue) {
  const spec = specForPropertyPath(currentDefinitionType, itemPath);

  if (!spec) {
    return null;
  }

  const enumRef = spec["x-enum-reference"];

  if (!enumRef) {
    return;
  }

  const segments = enumRef.$ref.split("/");
  const lastSegment = segments[segments.length - 1];

  const lastSegmentSegments = lastSegment.split(".");
  const enumName = lastSegmentSegments[lastSegmentSegments.length - 1];

  const enumSpec = apispec.definitions[lastSegment];

  if (!enumSpec) {
    return;
  }

  const found = enumSpec["x-enum-values"].find(
    e => Number(e.numericValue) === enumValue
  );

  return found && { ...found, enumName };
}
