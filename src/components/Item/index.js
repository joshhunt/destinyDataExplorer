import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router';

import { CLASSES } from 'app/lib/destinyEnums';
import { makeTypeShort } from 'src/lib/destinyUtils';

import BungieImage from 'src/components/BungieImage';
import Icon from 'src/components/Icon';

import s from './styles.styl';

function makeItemTypeName(item, type) {
  const shortType = makeTypeShort(type);
  const _klass = CLASSES[item.classType];
  const klass = _klass ? `${_klass} ` : '';
  const official = item.itemTypeName || item.itemTypeDisplayName;

  return official ? `${shortType}: ${klass}${official}` : shortType;
}

const NO_ICON = '/img/misc/missing_icon_d2.png';

const SUBSTITUTE_ICON = {
  DestinyLoreDefinition: 'book',
  DestinyItemCategoryDefinition: 'th-large',
  DestinyInventoryBucketDefinition: 'shopping-basket'
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
  isCollected
}) {
  const { def: item, type } = entry;
  const name = (item.displayProperties && item.displayProperties.name) || (
    <em>No name</em>
  );
  const icon =
    (item.displayProperties && item.displayProperties.icon) || NO_ICON;

  return (
    <Link
      to={pathForItem(type, item)}
      className={cx(s.root, className, isCollected && s.collected)}
      onClick={ev => onClick && onClick(ev, entry)}
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
      </div>
    </Link>
  );
}
