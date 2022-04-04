export function copyStr(str) {
  navigator.clipboard.writeText(str);
}
export function copyObj(str) {
  copyStr(JSON.stringify(str, null, 2));
}
