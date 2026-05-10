export function combineClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}
