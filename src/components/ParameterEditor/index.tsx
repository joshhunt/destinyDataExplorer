import React, { useEffect, useState } from "react";
import { OpenAPIV2 } from "openapi-types";
import ParameterTextField from "./types/ParameterTextField";
import { ParameterFieldProps } from "./types";
import ParameterBooleanField from "./types/ParameterBooleanField";
import ParameterArrayField from "./types/ParameterArrayField";

interface ParameterEditorProps {
  parameters: OpenAPIV2.Parameter[];
  values: Record<string, string>;
  onChange: (params: Record<string, string>) => void;
}

const ParameterEditor: React.FC<ParameterEditorProps> = ({
  parameters,
  values,
  onChange,
}) => {
  const onFieldChange = React.useCallback(
    (name, value) => {
      const newFields = { ...values, [name]: value };
      onChange(newFields);
    },
    [onChange, values]
  );

  return (
    <table style={{ width: "100%" }}>
      <thead>
        <tr>
          <td style={{ width: "25%" }}>Name</td>
          <td style={{ width: "25%" }}>Value</td>
          <td style={{ width: "50%" }}>Description</td>
        </tr>
      </thead>

      <tbody>
        {parameters.map((param) => (
          <tr key={param.name}>
            <td>
              <code>{param.name}</code>
            </td>
            <td>
              <ParameterField
                parameter={param}
                value={values[param.name]}
                onChange={onFieldChange}
              />
            </td>
            <td>{param.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ParameterField: React.FC<ParameterFieldProps> = ({
  parameter,
  value,
  onChange,
}) => {
  switch (parameter.type) {
    // boolean

    case "integer":
    case "string":
      return (
        <ParameterTextField
          parameter={parameter}
          value={value}
          onChange={onChange}
        />
      );

    case "boolean":
      return (
        <ParameterBooleanField
          parameter={parameter}
          value={value}
          onChange={onChange}
        />
      );

    case "array":
      return (
        <ParameterArrayField
          parameter={parameter}
          value={value}
          onChange={onChange}
        />
      );

    default:
      console.warn("unknown param type", parameter.type, parameter);
      return <span>unknown param type {parameter.type}</span>;
  }
};

export default ParameterEditor;
