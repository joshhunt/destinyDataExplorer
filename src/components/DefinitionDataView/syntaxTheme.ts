const syntaxTheme = {
  'code[class*="language-"]': {
    fontFamily:
      'Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: "14px",
    lineHeight: "1.375",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    background: "transparent",
    color: "var(--base02)",
  },
  'pre[class*="language-"]': {
    fontFamily:
      'Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: "14px",
    lineHeight: "1.375",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    background: "transparent",
    color: "var(--base02)",
    padding: "1em",
    margin: ".5em 0",
    overflow: "auto",
  },
  'pre > code[class*="language-"]': {
    fontSize: "1em",
  },
  'pre[class*="language-"]::-moz-selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'pre[class*="language-"] ::-moz-selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'code[class*="language-"]::-moz-selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'code[class*="language-"] ::-moz-selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'pre[class*="language-"]::selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'pre[class*="language-"] ::selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'code[class*="language-"]::selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  'code[class*="language-"] ::selection': {
    textShadow: "none",
    background: "var(--base06)",
  },
  ':not(pre) > code[class*="language-"]': {
    padding: ".1em",
    borderRadius: ".3em",
  },
  comment: {
    color: "var(--base04)",
  },
  prolog: {
    color: "var(--base04)",
  },
  doctype: {
    color: "var(--base04)",
  },
  cdata: {
    color: "var(--base04)",
  },
  punctuation: {
    color: "var(--base02)",
  },
  namespace: {
    Opacity: ".7",
  },
  operator: {
    color: "var(--base09)",
  },
  boolean: {
    color: "var(--base09)",
  },
  number: {
    color: "var(--base09)",
  },
  property: {
    color: "var(--base0D)",
  },
  tag: {
    color: "var(--base0D)",
  },
  string: {
    color: "var(--base0C)",
  },
  selector: {
    color: "var(--base0E)",
  },
  "attr-name": {
    color: "var(--base09)",
  },
  entity: {
    color: "var(--base0C)",
    cursor: "help",
  },
  url: {
    color: "var(--base0C)",
  },
  ".language-css .token.string": {
    color: "var(--base0C)",
  },
  ".style .token.string": {
    color: "var(--base0C)",
  },
  "attr-value": {
    color: "var(--base0B)",
  },
  keyword: {
    color: "var(--base0B)",
  },
  control: {
    color: "var(--base0B)",
  },
  directive: {
    color: "var(--base0B)",
  },
  unit: {
    color: "var(--base0B)",
  },
  statement: {
    color: "var(--base0C)",
  },
  regex: {
    color: "var(--base0C)",
  },
  atrule: {
    color: "var(--base0C)",
  },
  placeholder: {
    color: "var(--base0D)",
  },
  variable: {
    color: "var(--base0D)",
  },
  deleted: {
    textDecoration: "line-through",
  },
  inserted: {
    borderBottom: "1px dotted var(base00)",
    textDecoration: "none",
  },
  italic: {
    fontStyle: "italic",
  },
  important: {
    fontWeight: "bold",
    color: "var(--base08)",
  },
  bold: {
    fontWeight: "bold",
  },
  "pre > code.highlight": {
    Outline: "0.4em solid var(--base08)",
    OutlineOffset: ".4em",
  },
  ".line-numbers .line-numbers-rows": {
    borderRightColor: "var(--base06)",
  },
  ".line-numbers-rows > span:before": {
    color: "var(--base05)",
  },
  ".line-highlight": {
    background:
      "linear-gradient(to right, rgba(107, 115, 148, 0.2) 70%, rgba(107, 115, 148, 0))",
  },
};

export default syntaxTheme;
