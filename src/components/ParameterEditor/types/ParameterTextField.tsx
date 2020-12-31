import { ensureSchema } from "lib/apiSchemaUtils";
import React, { useCallback } from "react";
import { ParameterFieldProps } from "../types";

import s from "./styles.module.scss";

interface ParameterTextFieldProps extends ParameterFieldProps {}

const ParameterTextField: React.FC<ParameterTextFieldProps> = ({
  parameter,
  value,
  onChange,
}) => {
  const type =
    ensureSchema(parameter.schema).type === "integer" ? "number" : "text";

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
      placeholder={ensureSchema(parameter.schema).type}
      name={parameter.name}
      value={value || ""}
      onChange={handleChange}
    />
  );
};

export default ParameterTextField;
