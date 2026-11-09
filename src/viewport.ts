import { useEffect, useState } from "react";

export function useViewport(): { width: number; height: number; portrait: boolean; phone: boolean } {
  const [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return {
    width: size.width,
    height: size.height,
    portrait: size.height > size.width,
    phone: size.width <= 600,
  };
}
