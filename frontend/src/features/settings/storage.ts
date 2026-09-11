import {
  DEFAULT_SETTINGS,
  type AvatarId,
  type UserSettings,
} from "./types/settings.types";

export const SETTINGS_STORAGE_KEY = "apm-syn-settings";
export const SETTINGS_CHANGED_EVENT = "apm-syn:settings-changed";

type UnknownRecord = Record<string, unknown>;

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result: UnknownRecord = { ...(base as unknown as UnknownRecord) };

  for (const key of Object.keys(override)) {
    const baseValue = (base as unknown as UnknownRecord)[key];
    const overrideValue = (override as unknown as UnknownRecord)[key];

    if (
      overrideValue !== null &&
      typeof overrideValue === "object" &&
      !Array.isArray(overrideValue) &&
      baseValue !== null &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(
        baseValue as UnknownRecord,
        overrideValue as UnknownRecord
      );
    } else {
      result[key] = overrideValue;
    }
  }

  return result as T;
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return deepMerge(DEFAULT_SETTINGS, JSON.parse(raw) as Partial<UserSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function getAvatar(): AvatarId {
  return loadSettings().account.avatar;
}

export function notifySettingsChanged() {
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT));
}