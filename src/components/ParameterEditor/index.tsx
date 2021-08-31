import React from "react";
import cx from "classnames";
import { OpenAPIV3 } from "openapi-types";
import ParameterTextField from "./types/ParameterTextField";
import { AutofillSuggestion, ParameterFieldProps } from "./types";
import ParameterBooleanField from "./types/ParameterBooleanField";
import ParameterArrayField from "./types/ParameterArrayField";

import s from "./styles.module.scss";
import ParameterAuthField from "./types/ParameterAuthField";
import { DestinyProfileResponse } from "bungie-api-ts/destiny2";

interface ParameterEditorProps {
  title: React.ReactNode;
  className?: string;
  parameters: OpenAPIV3.ParameterObject[];
  values: Record<string, string>;
  destinyProfile: DestinyProfileResponse | undefined;
  onChange: (params: Record<string, string>) => void;
}

const ParameterEditor: React.FC<ParameterEditorProps> = ({
  title,
  className,
  parameters,
  values,
  destinyProfile,
  onChange,
}) => {
  const onFieldChange = React.useCallback(
    (name, value) => {
      const newFields = { ...values, [name]: value };
      onChange(newFields);
    },
    [onChange, values]
  );

  const handleSuggestion = React.useCallback(
    ({ userInfo, characterID }: AutofillSuggestion) => {
      let newFields = values;
      const setField = (name: string, value: string | number) => {
        newFields = {
          ...newFields,
          [name]: typeof value === "string" ? value : value.toString(),
        };
      };

      for (const param of parameters) {
        if (param.name === "membershipType" && userInfo) {
          setField(param.name, userInfo.membershipType);
        }

        if (param.name === "destinyMembershipId" && userInfo) {
          setField(param.name, userInfo.membershipId);
        }

        if (param.name === "characterId" && characterID) {
          setField(param.name, characterID);
        }
      }

      if (values !== newFields) {
        onChange(newFields);
      }
    },
    [values, parameters, onChange]
  );

  return (
    <div className={cx(s.root, className)}>
      <h3 className={s.title}>{title}</h3>

      <table className={s.table}>
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
              <td>{param["x-display-name"] || param.name}</td>
              <td>
                <ParameterField
                  parameter={param}
                  value={values[param.name]}
                  onChange={onFieldChange}
                  destinyProfile={destinyProfile}
                  onSuggest={handleSuggestion}
                />
              </td>
              <td>{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ParameterField: React.FC<ParameterFieldProps> = ({
  parameter,
  value,
  destinyProfile,
  onSuggest,
  onChange,
}) => {
  if (!parameter.schema || "$ref" in parameter.schema) {
    return <span>Parameter is unsupported</span>;
  }

  const type = parameter.schema.type || parameter.schema["x-custom-type"];

  switch (type) {
    case "integer":
    case "string":
      return (
        <ParameterTextField
          parameter={parameter}
          value={value}
          destinyProfile={destinyProfile}
          onChange={onChange}
          onSuggest={onSuggest}
        />
      );

    case "boolean":
      return (
        <ParameterBooleanField
          parameter={parameter}
          value={value}
          destinyProfile={destinyProfile}
          onChange={onChange}
          onSuggest={onSuggest}
        />
      );

    case "array":
      return (
        <ParameterArrayField
          parameter={parameter}
          value={value}
          destinyProfile={destinyProfile}
          onChange={onChange}
          onSuggest={onSuggest}
        />
      );

    case "x-dx-authorization":
      return (
        <ParameterAuthField
          parameter={parameter}
          value={value}
          destinyProfile={destinyProfile}
          onChange={onChange}
          onSuggest={onSuggest}
        />
      );

    default:
      console.warn("unknown param type", parameter);
      return (
        <span>
          Parameter type <code>{type}</code> is unsupported.
        </span>
      );
  }
};

export default ParameterEditor;
