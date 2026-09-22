'use client';
import {useSyncExternalStore} from 'react';
import {Sun, Moon} from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('qt-theme-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('qt-theme-change', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({
  className = '',
  showLabel = false
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const nextDark = !isDark;
    document.documentElement.classList.toggle('dark', nextDark);
    try {
      localStorage.setItem('qt-dark', String(nextDark));
    } catch {}
    window.dispatchEvent(
      new CustomEvent('qt-theme-change', {detail: {dark: nextDark}})
    );
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {showLabel && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
