import { DestinyCharacterComponent } from "bungie-api-ts/destiny2";
import React from "react";
import s from "./styles.module.scss";

import BungieImage from "components/BungieImage";

interface MiniCharacterCardProps {
  character: DestinyCharacterComponent | undefined;
}

const CLASS_NAME = {
  3: "Unknown",
  0: "Titan",
  1: "Hunter",
  2: "Warlock",
};

const MiniCharacterCard: React.FC<MiniCharacterCardProps> = ({ character }) => {
  if (!character) {
    return null;
  }

  return (
    <div className={s.root}>
      <div className={s.body}>
        <div className={s.imageWell}>
          <BungieImage
            className={s.crossSaveIcon}
            src={character.emblemPath}
            alt=""
          />
        </div>

        <div className={s.name}>{CLASS_NAME[character.classType]}</div>
      </div>
    </div>
  );
};

export default MiniCharacterCard;
