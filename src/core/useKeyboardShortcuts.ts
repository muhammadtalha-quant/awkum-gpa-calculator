import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

/**
 * Global keyboard shortcut hook.
 * - Handles Ctrl+Key combos (e.g. 'ctrl+s', 'ctrl+n')
 * - Handles bare keys ('escape')
 * - Guards against firing when focus is inside <input>, <textarea>, or <select>
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      // Build the key combo string
      const key = e.key.toLowerCase();
      const combo = e.ctrlKey ? `ctrl+${key}` : key;

      const action = shortcuts[combo];
      if (!action) return;

      // Allow Esc even when typing (to close modals)
      if (isTyping && combo !== 'escape') return;

      e.preventDefault();
      action();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
