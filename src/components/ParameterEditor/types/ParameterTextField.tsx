import Icon from "components/Icon";
import cx from "classnames";
import { ensureSchema } from "lib/apiSchemaUtils";
import React, { useCallback, useState } from "react";
import { ParameterFieldProps } from "../types";

import s from "./styles.module.scss";
import MiniCharacterCard from "components/MiniProfileCard/MiniCharacterCard";

interface ParameterTextFieldProps extends ParameterFieldProps {}

const DESTINY_PROFILE_FIELDS = ["destinyMembershipId", "membershipType"];
const DESTINY_CHARACTER_FIELDS = ["characterId"];
const AUTOFILL_FIELDS = DESTINY_PROFILE_FIELDS.concat(DESTINY_CHARACTER_FIELDS);

const useClickOutside = (ref: any, callback: any) => {
  const handleClick = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

const ParameterTextField: React.FC<ParameterTextFieldProps> = ({
  parameter,
  value,
  onChange,
  destinyProfile,
  onSuggest,
}) => {
  const clickRef = React.useRef<any>();
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useClickOutside(clickRef, () => setSuggestionsOpen(false));

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parameter.name, ev.target.value);
    },
    [onChange, parameter.name]
  );

  const handleAccessoryClicked = () => {
    if (DESTINY_PROFILE_FIELDS.includes(parameter.name)) {
      onSuggest({ userInfo: destinyProfile?.profile.data?.userInfo });
    } else if (DESTINY_CHARACTER_FIELDS.includes(parameter.name)) {
      setSuggestionsOpen((v) => !v);
    }
  };

  const handleCharacterClicked = (characterID: string) => {
    setSuggestionsOpen(false);
    onSuggest({
      userInfo: destinyProfile?.profile.data?.userInfo,
      characterID,
    });
  };

  const hasAutofill =
    destinyProfile && AUTOFILL_FIELDS.includes(parameter.name);

  return (
    <div className={s.textInputWrapper} ref={clickRef}>
      <input
        className={cx(s.textInput, hasAutofill && s.withAccessory)}
        placeholder={ensureSchema(parameter.schema).type}
        name={parameter.name}
        value={value || ""}
        onChange={handleChange}
      />

      {hasAutofill && (
        <button
          className={cx(s.inputAccessory, suggestionsOpen && s.active)}
          onClick={handleAccessoryClicked}
        >
          <Icon name="user-circle" duotone />
        </button>
      )}

      {suggestionsOpen && (
        <div className={s.suggestions}>
          <p className={s.suggestionExplainer}>Fill from logged in profile:</p>

          {Object.values(destinyProfile?.characters.data ?? {}).map(
            (character) => (
              <button
                key={character.characterId}
                className={s.profileButton}
                onClick={() => handleCharacterClicked(character.characterId)}
              >
                <MiniCharacterCard character={character} />
              </button>
            )
          )}

          {/* <button className={s.profileButton} onClick={handleProfileClicked}>
            <MiniProfileCard destinyProfile={destinyProfile} />
          </button> */}
        </div>
      )}
    </div>
  );
};

export default ParameterTextField;
