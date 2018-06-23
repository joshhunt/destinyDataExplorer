import React from 'react';
import cx from 'classnames';

import { CLASSES } from 'app/lib/destinyEnums';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

export default function Item({ className, item }) {
  const {
    displayProperties: { name, icon: _icon }
  } = item;

  const icon = _icon || '/img/misc/missing_icon_d2.png';

  return (
    <div className={cx(s.root, className)}>
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
    </div>
  );
}
