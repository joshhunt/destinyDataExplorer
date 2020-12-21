import BungieImage from "components/BungieImage";
import { bungieUrl } from "lib/destinyUtils";
import React from "react";

import s from "./jsonStyles.module.scss";

interface ImageJsonValueProps {
  value: string;
}

const ImageJsonValue: React.FC<ImageJsonValueProps> = ({ value }) => {
  return (
    <a href={bungieUrl(value)} className={s.jsonLinkedValue}>
      <BungieImage className={s.imageJsonValue} src={value} alt="preview" />
    </a>
  );
};

export default ImageJsonValue;
