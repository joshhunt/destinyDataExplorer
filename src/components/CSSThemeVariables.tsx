import React from "react";
import Theme from "./NewDataView/theme";

interface CSSThemeVariablesProps {
  theme: typeof Theme;
}

const CSSThemeVariables: React.FC<CSSThemeVariablesProps> = ({
  theme,
  children,
}) => {
  const style = Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [`--${key}`, value])
  ) as React.CSSProperties;

  return <div style={style}>{children}</div>;
};

export default CSSThemeVariables;
