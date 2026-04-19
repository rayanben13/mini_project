import { create } from "zustand";

const DarkModeStore = create((set, get) => ({
  Mod: false,

  // Initialize dark mode on load
  initDarkMode: () => {
    const theme = localStorage.getItem("theme");
    const isDark =
      theme === "dark" ||
      (theme === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
      set({ Mod: false });
    } else {
      document.documentElement.classList.remove("dark");
      set({ Mod: true });
    }
  },

  HandlDarkMode: () => {
    const currentMod = get().Mod;
    const newMod = !currentMod;

    set({ Mod: newMod });

    if (newMod) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  },
}));

export default DarkModeStore;
