import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('uniben-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('uniben-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('uniben-theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="w-12 h-12 bg-white dark:bg-[#1E172E] border-2 border-slate-200 dark:border-[#3A2D54] rounded-2xl flex items-center justify-center text-slate-600 dark:text-purple-300 hover:bg-slate-50 dark:hover:bg-[#2C2142] transition-colors shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      aria-label="Toggle Dark Mode"
      title="Toggle Dark Mode"
    >
      {isDark ? <Sun className="w-5 h-5 text-purple-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
    </button>
  );
}
