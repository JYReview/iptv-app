import { useCallback, useEffect, useRef, useState } from "react";
import { isArrowKey, isBackKey, isEnterKey } from "../utils/tvNavigation.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getStoredIndex(storageKey, fallback) {
  if (typeof window === "undefined" || !storageKey) return fallback;

  try {
    const v = Number(sessionStorage.getItem(storageKey));
    return Number.isFinite(v) ? v : fallback;
  } catch {
    return fallback;
  }
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
  const refs = useRef([]);

  // --- safe initial state
  const [activeIndex, setActiveIndex] = useState(() => {
    if (itemCount <= 0) return -1;
    return clamp(
      getStoredIndex(storageKey, initialIndex),
      0,
      itemCount - 1
    );
  });

  // ===============================
  // 1. FIX INVALID INDEX ON CHANGE
  // ===============================
  useEffect(() => {
    if (itemCount <= 0) {
      setActiveIndex(-1);
      refs.current = [];
      return;
    }

    setActiveIndex((prev) => {
      const safePrev = Number.isFinite(prev) ? prev : 0;
      return clamp(safePrev, 0, itemCount - 1);
    });

    refs.current = refs.current.slice(0, itemCount);
  }, [itemCount]);

  // ===============================
  // 2. PERSIST ONLY VALID INDEX
  // ===============================
  useEffect(() => {
    if (!storageKey) return;
    if (activeIndex < 0) return;

    try {
      sessionStorage.setItem(storageKey, String(activeIndex));
    } catch {}
  }, [activeIndex, storageKey]);

  // ===============================
  // 3. SAFE FOCUS
  // ===============================
  const focusItem = useCallback(
    (index) => {
      if (itemCount <= 0) return;

      const safeIndex = clamp(index, 0, itemCount - 1);
      setActiveIndex(safeIndex);

      requestAnimationFrame(() => {
        refs.current[safeIndex]?.focus?.();
      });
    },
    [itemCount]
  );

  // ===============================
  // 4. KEY NAVIGATION
  // ===============================
  const handleKeyDown = useCallback(
    (event) => {
      if (isBackKey(event)) {
        event.preventDefault();
        onBack?.();
        return;
      }

      if (isEnterKey(event)) {
        event.preventDefault();
        if (activeIndex >= 0) onActivate?.(activeIndex);
        return;
      }

      if (!isArrowKey(event)) return;
      if (itemCount <= 0) return;

      let next = activeIndex;

      switch (event.key) {
        case "ArrowDown":
          next =
            orientation === "grid"
              ? activeIndex + columns
              : activeIndex + 1;
          break;

        case "ArrowUp":
          next =
            orientation === "grid"
              ? activeIndex - columns
              : activeIndex - 1;
          break;

        case "ArrowRight":
          if (
            orientation === "grid" &&
            (activeIndex + 1) % columns !== 0
          ) {
            next = activeIndex + 1;
          }
          break;

        case "ArrowLeft":
          if (
            orientation === "grid" &&
            activeIndex % columns !== 0
          ) {
            next = activeIndex - 1;
          }
          break;
      }

      next = clamp(next, 0, itemCount - 1);

      if (next !== activeIndex) {
        event.preventDefault();
        focusItem(next);
      }
    },
    [activeIndex, columns, itemCount, orientation, focusItem, onActivate, onBack]
  );

  // ===============================
  // 5. ITEM PROPS (SAFE + CLEAN)
  // ===============================
  const getItemProps = useCallback(
    (index) => ({
      ref: (node) => {
        refs.current[index] = node;
      },
      tabIndex: index === activeIndex ? 0 : -1,
      onFocus: () => setActiveIndex(index),
      "aria-selected": index === activeIndex,
    }),
    [activeIndex]
  );

  return {
    activeIndex,
    focusItem,
    getItemProps,
    handleKeyDown,
  };
}