import { useState, useEffect, useRef, useCallback } from "react";
import { RESIZE_DEBOUNCE_DELAY } from "../constants/timing";

/**
 * Custom hook to track window dimensions.
 * Updates automatically when the window is resized with debouncing.
 *
 * @returns {{ width: number, height: number }} Current window dimensions
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const timeoutRef = useRef(null);

  const handleResize = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the resize handler
    timeoutRef.current = setTimeout(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, RESIZE_DEBOUNCE_DELAY);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      // Cleanup timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleResize]);

  return dimensions;
}
