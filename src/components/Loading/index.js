import React from 'react';

import Icon from 'src/components/Icon';

import s from './styles.styl';

export default function Loading({ children, noSpin }) {
  return (
    <div className={s.root}>
      <div className={s.text}>
        {!noSpin && <Icon name="spinner-third" className={s.icon} spin />}{' '}
        {children || `Loading...`}
      </div>
    </div>
  );
}
