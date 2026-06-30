import { create } from 'zustand';

export const useThemeStore = create((set) => {
  const savedTheme = localStorage.getItem('tradex_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    theme: savedTheme,
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('tradex_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    })
  };
});
