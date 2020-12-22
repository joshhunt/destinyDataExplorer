import React from "react";
import { ServerResponse } from "bungie-api-ts/common";
import { DestinyProfileResponse } from "bungie-api-ts/destiny2/interfaces";
import JsonValueAnnotation from "./JsonValueAnnotation";
import { useSelector } from "react-redux";
import { ReduxStore } from "types";
import { definitionFromStore, getDisplayName } from "lib/destinyTsUtils";

import s from "./jsonStyles.module.scss";

interface CharacterJsonValueProps {
  value: any;
  data: any;
}

const CharacterJsonValue: React.FC<CharacterJsonValueProps> = ({
  value,
  data,
  children,
}) => {
  const characterData = getCharacterData(value, data);
  const { classDefinition } = useSelector((store: ReduxStore) => {
    const classDefinition =
      characterData &&
      definitionFromStore(
        store,
        "DestinyClassDefinition",
        characterData.classHash
      );

    return { classDefinition };
  });

  if (!characterData) {
    return <>children</>;
  }

  return (
    <JsonValueAnnotation value={children}>
      <span className={s.unlinkedJsonValue}>
        character {classDefinition && getDisplayName(classDefinition)}
      </span>
    </JsonValueAnnotation>
  );
};

export default CharacterJsonValue;

export function getCharacterData(rawValue: any, data: any) {
  if (typeof rawValue !== "string" || !isProfileResponse(data)) {
    return undefined;
  }

  const characterData = data.Response.characters?.data?.[rawValue];

  return characterData ? characterData : undefined;
}

export function isCharacterId(rawValue: any, data: any) {
  return !!getCharacterData(rawValue, data);
}

function isProfileResponse(
  data: any
): data is ServerResponse<DestinyProfileResponse> {
  if (data.Response?.profile?.data) {
    return true;
  }

  return false;
}
