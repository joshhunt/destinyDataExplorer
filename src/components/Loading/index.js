import React from 'react';

import Icon from 'src/components/Icon';

import s from './styles.styl';

export default function Loading({ children }) {
  return (
    <div className={s.root}>
      <div className={s.text}>
        <Icon name="spinner-third" className={s.icon} spin />{' '}
        {children || `Loading...`}
      </div>
    </div>
  );
}
