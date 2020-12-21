import React, { useCallback } from "react";
import { ParameterFieldProps } from "../types";

import s from "./styles.module.scss";

interface ParameterTextFieldProps extends ParameterFieldProps {}

const ParameterTextField: React.FC<ParameterTextFieldProps> = ({
  parameter,
  value,
  onChange,
}) => {
  const type = parameter.type === "integer" ? "number" : "text";

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parameter.name, ev.target.value);
    },
    [onChange, parameter.name]
  );

  return (
    <input
      className={s.textInput}
      type={type}
      placeholder={parameter.type}
      name={parameter.name}
      value={value}
      onChange={handleChange}
    />
  );
};

export default ParameterTextField;
