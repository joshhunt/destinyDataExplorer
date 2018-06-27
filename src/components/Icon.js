import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(require('@fortawesome/pro-light-svg-icons/faBook').faBook);

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
