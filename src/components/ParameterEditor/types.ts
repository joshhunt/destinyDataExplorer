import { OpenAPIV3 } from "openapi-types";

export interface ParameterFieldProps {
  parameter: OpenAPIV3.ParameterObject;
  value: string | undefined;
  onChange: (name: string, value: string) => void;
}
