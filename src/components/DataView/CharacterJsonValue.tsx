import React from "react";
import { ServerResponse } from "bungie-api-ts/common";
import { DestinyProfileResponse } from "bungie-api-ts/destiny2/interfaces";
import JsonValueAnnotation from "./JsonValueAnnotation";
import { useSelector } from "react-redux";
import { ReduxState } from "types";
import { definitionFromStore, getDisplayName } from "lib/destinyTsUtils";

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
  const { classDefinition } = useSelector((store: ReduxState) => {
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
      character "{classDefinition && getDisplayName(classDefinition)}""
    </JsonValueAnnotation>
  );
};

export default CharacterJsonValue;

export function getCharacterData(rawValue: any, data: any) {
  if (typeof rawValue !== "string" || !isProfileResponse(data)) {
    return undefined;
  }

  return data.Response.characters?.data?.[rawValue];
}

export function isCharacterId(rawValue: any, data: any) {
  return !!getCharacterData(rawValue, data);
}

function isProfileResponse(
  data: any
): data is ServerResponse<DestinyProfileResponse> {
  if (data.Response?.profile?.data || data.Response?.characters?.data) {
    return true;
  }

  return false;
}
