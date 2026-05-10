export const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
export const BACK_KEYS = ["Backspace", "Escape", "BrowserBack", "SoftBack", "GoBack"];

export function isArrowKey(event) {
  return ARROW_KEYS.includes(event.key);
}

export function isBackKey(event) {
  return BACK_KEYS.includes(event.key);
}

export function isEnterKey(event) {
  return event.key === "Enter" || event.key === " ";
}
