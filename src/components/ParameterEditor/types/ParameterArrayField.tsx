import { getReferencedSchema } from "lib/apiSchemaUtils";
import React from "react";
import Select from "react-select";
import { ParameterFieldProps } from "../types";

import s from "./styles.module.scss";

interface ParameterArrayFieldProps extends ParameterFieldProps {}

interface EnumValueItem {
  numericValue: string;
  identifier: string;
  description?: string;
}

const ParameterArrayField: React.FC<ParameterArrayFieldProps> = ({
  parameter,
  onChange,
  value,
}) => {
  const enumRef =
    parameter.schema &&
    "items" in parameter.schema &&
    parameter.schema.items &&
    "x-enum-reference" in parameter.schema.items &&
    parameter.schema.items["x-enum-reference"]?.$ref;

  const enumItems = enumRef ? getReferencedSchema(enumRef) : undefined;
  const enumItemValues =
    enumItems && (enumItems["x-enum-values"] as EnumValueItem[]);

  if (!enumItemValues) {
    console.warn("Parameter is missing x-enum-values", parameter);
    return <span>Parameter is missing x-enum-values</span>;
  }

  const options = enumItemValues.map((item) => ({
    value: item.numericValue,
    label: item.identifier,
  }));

  const handleChange = (value: iOption[] | null) => {
    console.log(value);
    onChange(parameter.name, (value ?? []).map((v) => v.value).join(","));
  };

  const defaultValue = (value ?? "")
    .split(",")
    .map((vItem) => options.find((v) => v.value === vItem))
    .filter(Boolean);

  return (
    <Select
      className={s.reselectInput}
      options={options}
      isMulti={true}
      defaultValue={defaultValue}
      onChange={(v) => handleChange(v as unknown as iOption[] | null)}
    />
  );
};

export default ParameterArrayField;

interface iOption {
  label: string;
  value: string;
}
