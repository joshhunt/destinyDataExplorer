import React from "react";
import cx from "classnames";
import { Link } from "react-router-dom";

import { CLASSES } from "lib/destinyEnums";
import { makeTypeShort } from "lib/destinyUtils";

import BungieImage from "components/BungieImage";
import Icon from "components/Icon";

import s from "./styles.module.scss";
import { getDisplayName } from "lib/destinyTsUtils";

const DUMMIES_HASH = 3109687656;

function makeItemTypeName(item, type) {
  const shortType = makeTypeShort(type);
  const _klass = CLASSES[item.classType];
  const klass = _klass ? `${_klass} ` : "";
  const official = item.itemTypeName || item.itemTypeDisplayName;

  if (
    !official &&
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(DUMMIES_HASH)
  ) {
    return `${shortType}: Dummy item`;
  }

  return official ? `${shortType}: ${klass}${official}` : shortType;
}

const NO_ICON = "/img/misc/missing_icon_d2.png";

const SUBSTITUTE_ICON = {
  DestinyLoreDefinition: "book",
  DestinyItemCategoryDefinition: "th-large",
  DestinyInventoryBucketDefinition: "shopping-basket",
  DestinyHistoricalStatsDefinition: "trophy",
};

function SubstituteIcon({ type }) {
  const sub = SUBSTITUTE_ICON[type];

  return sub ? (
    <div className={s.substituteIcon}>
      <Icon name={sub} light />
    </div>
  ) : (
    <BungieImage className={s.icon} src={NO_ICON} />
  );
}

export default function Item({
  className,
  entry,
  pathForItem,
  onClick,
  isCollected,
  children = <></>,
}) {
  const { def: item, type } = entry;

  if (!item) {
    console.warn("Item is empty for entry", entry);
    return null;
  }

  const name = getDisplayName(item) || <em>No name</em>;
  const icon =
    (item.displayProperties && item.displayProperties.icon) ||
    item.iconImage ||
    NO_ICON;

  return (
    <Link
      to={pathForItem(type, entry)}
      className={cx(s.root, className, isCollected && s.collected)}
      onClick={(ev) => onClick && onClick(ev, entry)}
    >
      <div className={s.accessory}>
        {icon === NO_ICON ? (
          <SubstituteIcon type={type} />
        ) : (
          <BungieImage className={s.icon} src={icon} />
        )}
      </div>

      <div className={s.main}>
        <div className={s.name}>{name}</div>
        <div className={s.itemType}>{makeItemTypeName(item, type)}</div>
        <div className={s.children}>{children}</div>
      </div>
    </Link>
  );
}
