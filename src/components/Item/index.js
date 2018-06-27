import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router';

import { CLASSES } from 'app/lib/destinyEnums';
import { makeTypeShort } from 'src/lib/destinyUtils';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

function makeItemTypeName(item, type) {
  const shortType = makeTypeShort(type);
  const _klass = CLASSES[item.classType];
  const klass = _klass ? `${_klass} ` : '';
  const official = item.itemTypeName || item.itemTypeDisplayName;

  return official ? `${shortType}: ${klass}${official}` : shortType;
}

export default function Item({ className, item, type, pathForItem }) {
  const {
    displayProperties: { name, icon: _icon }
  } = item;

  const icon = _icon || '/img/misc/missing_icon_d2.png';

  return (
    <Link to={pathForItem(type, item)} className={cx(s.root, className)}>
      <div className={s.accessory}>
        <BungieImage className={s.icon} src={icon} />
      </div>

      <div className={s.main}>
        <div className={s.name}>{name}</div>
        <div className={s.itemType}>{makeItemTypeName(item, type)}</div>
      </div>
    </Link>
  );
}
