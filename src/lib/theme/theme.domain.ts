export type ThemePreference = "system" | "light" | "dark";
export const themeStorageKey = "unimind.appearance.v1";

export function themePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolvedTheme(
  preference: ThemePreference,
  darkSystem: boolean,
) {
  return preference === "system" ? (darkSystem ? "dark" : "light") : preference;
}

// No identity, content or catalog state is stored here. Run before the body can paint.
export const themeBootstrap = `(() => {
  let preference = 'system';
  try { const saved = localStorage.getItem('${themeStorageKey}');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}
  const root = document.documentElement;
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === 'system' ? (dark ? 'dark' : 'light') : preference;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#1b1c1f' : '#f6f7f8');
})();`;
