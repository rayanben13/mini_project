import { create } from 'zustand';

const DarkModeStore = create((set, get) => ({
  Mod: false,

  ShowDarkmod: () => {
    let theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');

      set({ Mod: false });
    } else {
      document.documentElement.classList.remove('dark');
      set({ Mod: true });
    }
  },

  HandlDarkMode: () => {
    const currentMod = get().Mod;
    const newMod = !currentMod;

    set({ Mod: newMod });

    if (newMod) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'lite');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  },
}));

export default DarkModeStore;
