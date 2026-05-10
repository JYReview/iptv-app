import { useCallback, useEffect, useRef, useState } from "react";
import { isArrowKey, isBackKey, isEnterKey } from "../utils/tvNavigation.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getStoredIndex(storageKey, defaultIndex) {
  if (typeof window === "undefined" || !storageKey) return defaultIndex;
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  } catch {
    // ignore storage failures
  }
  return defaultIndex;
}

export function useTVFocus({
  itemCount = 0,
  columns = 1,
  orientation = "grid",
  storageKey,
  initialIndex = 0,
  onActivate,
  onBack,
}) {
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(() => clamp(getStoredIndex(storageKey, initialIndex), 0, Math.max(0, itemCount - 1)));

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    try {
      window.sessionStorage.setItem(storageKey, String(activeIndex));
    } catch {
      // ignore storage failures
    }
  }, [activeIndex, storageKey]);

  useEffect(() => {
    if (itemCount > 0 && activeIndex >= itemCount) {
      setActiveIndex(itemCount - 1);
    }
  }, [activeIndex, itemCount]);

  const focusItem = useCallback(
    (index) => {
      const nextIndex = clamp(index, 0, Math.max(0, itemCount - 1));
      setActiveIndex(nextIndex);
      requestAnimationFrame(() => {
        itemRefs.current[nextIndex]?.focus();
      });
    },
    [itemCount],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (isBackKey(event)) {
        event.preventDefault();
        onBack?.();
        return;
      }

      if (isEnterKey(event)) {
        event.preventDefault();
        onActivate?.(activeIndex);
        return;
      }

      if (!isArrowKey(event)) {
        return;
      }

      let nextIndex = activeIndex;
      switch (event.key) {
        case "ArrowDown":
          nextIndex = orientation === "grid" ? activeIndex + columns : activeIndex + 1;
          break;
        case "ArrowUp":
          nextIndex = orientation === "grid" ? activeIndex - columns : activeIndex - 1;
          break;
        case "ArrowRight":
          if (orientation === "grid" && (activeIndex + 1) % columns !== 0) {
            nextIndex = activeIndex + 1;
          }
          break;
        case "ArrowLeft":
          if (orientation === "grid" && activeIndex % columns !== 0) {
            nextIndex = activeIndex - 1;
          }
          break;
        default:
          break;
      }

      nextIndex = clamp(nextIndex, 0, Math.max(0, itemCount - 1));
      if (nextIndex !== activeIndex) {
        event.preventDefault();
        focusItem(nextIndex);
      }
    },
    [activeIndex, columns, focusItem, itemCount, onActivate, onBack, orientation],
  );

  const getItemProps = useCallback(
    (index) => ({
      ref: (node) => {
        itemRefs.current[index] = node;
      },
      tabIndex: index === activeIndex ? 0 : -1,
      onFocus: () => setActiveIndex(index),
      "aria-selected": index === activeIndex ? true : undefined,
    }),
    [activeIndex],
  );

  return {
    activeIndex,
    focusItem,
    getItemProps,
    handleKeyDown,
  };
}
