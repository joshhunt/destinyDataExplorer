import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(
  require('@fortawesome/pro-light-svg-icons/faBook').faBook,
  require('@fortawesome/pro-light-svg-icons/faThLarge').faThLarge,
  require('@fortawesome/pro-light-svg-icons/faShoppingBasket').faShoppingBasket,
  require('@fortawesome/pro-regular-svg-icons/faPlus').faPlus,
  require('@fortawesome/pro-regular-svg-icons/faSync').faSync,
  require('@fortawesome/pro-regular-svg-icons/faSpinnerThird').faSpinnerThird,
  require('@fortawesome/pro-regular-svg-icons/faQuestionCircle')
    .faQuestionCircle
);

export default function Icon({ icon, name, brand, light, solid, ...props }) {
  let prefix = 'far';

  if (brand) {
    prefix = 'fab';
  } else if (light) {
    prefix = 'fal';
  } else if (solid) {
    prefix = 'fas';
  }

  return <FontAwesomeIcon icon={[prefix, icon || name]} {...props} />;
}
