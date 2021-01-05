import CSSThemeVariables from "components/CSSThemeVariables";
import cx from "classnames";
import theme from "components/NewDataView/theme";
import React, { useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import s from "./styles.module.scss";
import syntaxTheme from "./syntaxTheme";

interface RawJSONProps {
  data: any;
  limitHeight: boolean;
}

const RawJSON: React.FC<RawJSONProps> = ({ data, limitHeight }) => {
  const stringified = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return (
    <div className={cx(s.rawJson, limitHeight && s.limitHeight)}>
      <CSSThemeVariables theme={theme}>
        <SyntaxHighlighter language="json" style={syntaxTheme}>
          {stringified}
        </SyntaxHighlighter>
      </CSSThemeVariables>
    </div>
  );
};

export default RawJSON;
