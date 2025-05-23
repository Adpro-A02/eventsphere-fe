"use client";

import { useEffect, useState } from "react";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Only render the theme provider after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a simple div during SSR
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
