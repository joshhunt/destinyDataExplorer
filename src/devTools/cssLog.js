let cssReset =
  "font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji";
let cssCollector = [];

function css(str, cssStr) {
  cssCollector.push(`${cssReset};${cssStr}`);
  cssCollector.push(cssReset);
  return `%c${str}%c`;
}

function log(msg) {
  console.log(`%c${msg}`, cssReset, ...cssCollector);
  cssCollector = [];
}

css.log = log;

export default css;
