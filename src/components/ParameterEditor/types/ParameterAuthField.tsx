import OAuthLoginButton from "components/OAuthLoginButton";
import { useBungieAuth } from "lib/bungieAuth";
import React, { useCallback } from "react";
import { ParameterFieldProps } from "../types";
import s from "./styles.module.scss";

interface ParameterAuthFieldProps extends ParameterFieldProps {}

const ParameterAuthField: React.FC<ParameterAuthFieldProps> = ({
  parameter,
  value,
  onChange,
}) => {
  const bungieAuth = useBungieAuth();

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parameter.name, ev.target.checked);
    },
    [onChange, parameter]
  );

  if (!bungieAuth) {
    return (
      <OAuthLoginButton className={s.inlineButton}>
        Login to Bungie.net to include OAuth access token
      </OAuthLoginButton>
    );
  }

  return (
    <label className={s.specialValue}>
      <input type="checkbox" checked={!!value} onChange={handleChange} /> OAuth
      access_token
    </label>
  );
};

export default ParameterAuthField;
