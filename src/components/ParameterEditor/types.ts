import { DestinyProfileResponse } from "bungie-api-ts/destiny2";
import { UserInfoCard } from "bungie-api-ts/user/interfaces";
import { OpenAPIV3 } from "openapi-types";

export interface ParameterFieldProps {
  parameter: OpenAPIV3.ParameterObject;
  value: string | undefined;
  onChange: (name: string, value: string | number | boolean) => void;
  destinyProfile: DestinyProfileResponse | undefined;
  onSuggest: (arg0: AutofillSuggestion) => void;
}

export interface AutofillSuggestion {
  userInfo?: UserInfoCard;
  characterID?: string;
}
