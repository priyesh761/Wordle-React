import { useState, useEffect } from "react";

/**
 * Custom hook to track window dimensions.
 * Updates automatically when the window is resized.
 *
 * @returns {{ width: number, height: number }} Current window dimensions
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}
