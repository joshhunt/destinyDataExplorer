import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router';

import { CLASSES } from 'app/lib/destinyEnums';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

export default function Item({ className, item, pathForItem }) {
  const {
    displayProperties: { name, icon: _icon },
    hash
  } = item;

  const icon = _icon || '/img/misc/missing_icon_d2.png';

  return (
    <Link
      to={pathForItem('InventoryItem', item)}
      className={cx(s.root, className)}
    >
      <div className={s.accessory}>
        <BungieImage className={s.icon} src={icon} />
      </div>

      <div className={s.main}>
        <div className={s.name}>{name}</div>
        <div className={s.itemType}>
          {CLASSES[item.classType]}{' '}
          {item.itemTypeName || item.itemTypeDisplayName}
        </div>
      </div>
    </Link>
  );
}
