import React, { useCallback } from "react";
import { ParameterFieldProps } from "../types";

interface ParameterBooleanFieldProps extends ParameterFieldProps {}

const ParameterBooleanField: React.FC<ParameterBooleanFieldProps> = ({
  parameter,
  value,
  onChange,
}) => {
  const checked = value === "true";

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parameter.name, ev.target.checked ? "true" : "false");
    },
    [onChange, parameter.name]
  );

  return (
    <input type="checkbox" checked={checked ?? false} onChange={handleChange} />
  );
};

export default ParameterBooleanField;
