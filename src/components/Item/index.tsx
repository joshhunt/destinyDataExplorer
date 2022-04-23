import React from "react";
import cx from "classnames";
import { Link } from "react-router-dom";

import BungieImage from "components/BungieImage";
import Icon from "components/Icon";

import s from "./styles.module.scss";
import {
  getDisplayName,
  getIcon,
  itemTypeDisplayName,
} from "lib/destinyTsUtils";
import { PathForItemFn, WrappedDefinition } from "types";

const NO_ICON = "/img/misc/missing_icon_d2.png";

const SUBSTITUTE_ICON: Record<string, string> = {
  DestinyLoreDefinition: "book",
  DestinyItemCategoryDefinition: "th-large",
  DestinyInventoryBucketDefinition: "shopping-basket",
  DestinyHistoricalStatsDefinition: "trophy",
};

function SubstituteIcon({ type }: { type: string }) {
  const sub = SUBSTITUTE_ICON[type];

  return sub ? (
    <div className={s.substituteIcon}>
      <Icon name={sub} light />
    </div>
  ) : (
    <BungieImage className={s.icon} src={NO_ICON} />
  );
}

interface ItemProps<TEntry = WrappedDefinition> {
  className?: string;
  entry: TEntry;
  pathForItem: PathForItemFn; // TOPDO: make optional
  onClick?: (ev: React.MouseEvent<HTMLAnchorElement>, entry: TEntry) => void;
  isCollected: boolean;
}

const Item: React.FC<ItemProps> = ({
  className,
  entry,
  pathForItem,
  onClick,
  isCollected,
  children,
}) => {
  const { def: definition, type } = entry;

  if (!definition) {
    console.warn("Item is empty for entry", entry);
    return null;
  }

  const name = getDisplayName(definition) || <em>No name</em>;
  const icon = getIcon(definition) || NO_ICON;

  return (
    <Link
      to={pathForItem(type, definition)}
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
        <div className={s.name}>
          {(definition as any).$$extra && <span className={s.extraIndicator} />}{" "}
          <span>{name}</span>
        </div>
        <div className={s.itemType}>
          {itemTypeDisplayName(definition, type)}
        </div>
        {children && <div className={s.children}>{children}</div>}
      </div>
    </Link>
  );
};

export default Item;
