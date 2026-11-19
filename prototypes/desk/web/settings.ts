import { createContext, useEffect, useState } from 'react';

export const settingsKey = 'presidential-desk-presentation';
export const defaults = { scale: 100, mapScale: 100, contrast: false, lamp: false, plain: false, muted: true, speed: 'brisk' };
export type Settings = typeof defaults;
export const SettingsContext = createContext(defaults);
export function readSettings(): Settings {
  try {
    const value = JSON.parse(localStorage.getItem(settingsKey) ?? '{}');
    return { scale: typeof value.scale === 'number' ? Math.max(80, Math.min(200, value.scale)) : 100,
      mapScale: typeof value.mapScale === 'number' ? Math.max(80, Math.min(200, value.mapScale)) : 100,
      contrast: value.contrast === true, lamp: value.lamp === true, plain: value.plain === true,
      muted: value.muted !== false, speed: ['brisk', 'slow', 'instant'].includes(value.speed) ? value.speed : 'brisk' };
  } catch { return { ...defaults }; }
}
export function useSettings() {
  const [settings, setSettings] = useState(readSettings);
  useEffect(() => { try { localStorage.setItem(settingsKey, JSON.stringify(settings)); } catch { /* A private page can still use the controls. */ } }, [settings]);
  return [settings, setSettings] as const;
}
export function isTyping(target: EventTarget | null) {
  return target instanceof Element && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]');
}
