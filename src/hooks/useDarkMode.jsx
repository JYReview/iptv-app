import { useEffect } from "react";

export function useDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.backgroundColor = "#0B0F17";
  }, []);
}
