import { OpenAPIV2 } from "openapi-types";

export interface ParameterFieldProps {
  parameter: OpenAPIV2.Parameter;
  value: string | undefined;
  onChange: (name: string, value: string) => void;
}
