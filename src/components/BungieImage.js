import React from "react";

import { bungieUrl } from "lib/destinyUtils";

export default function BungieImage({ src, ...props }) {
  return <img src={bungieUrl(src)} {...props} alt="" />;
}
