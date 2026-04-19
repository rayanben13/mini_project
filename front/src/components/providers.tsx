"use client";

import { useEffect } from "react";
import DarkModeStore from "../Store/darkModSroe";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { initDarkMode } = DarkModeStore();

  useEffect(() => {
    initDarkMode();
  }, []);

  return <>{children}</>;
}
