"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { ReaderMode } from "@/lib/reader-progress";

export type ReaderTheme = "dark" | "amber" | "paper";

export type ReaderSettings = {
  mode: ReaderMode;
  theme: ReaderTheme;
  fontSize: number;
  lineHeight: number;
  wide: boolean;
};

const DEFAULT_SETTINGS: ReaderSettings = {
  mode: "scroll",
  theme: "dark",
  fontSize: 16,
  lineHeight: 2,
  wide: false,
};

const LOCAL_STORAGE_KEY = "sl-reader-preferences";
const LEGACY_STORAGE_KEY = "streetlight-reader-settings";

function isReaderMode(value: unknown): value is ReaderMode {
  return value === "scroll" || value === "page";
}

function isReaderTheme(value: unknown): value is ReaderTheme {
  return value === "dark" || value === "amber" || value === "paper";
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeSettings(value: unknown): ReaderSettings {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<ReaderSettings> & { fontScale?: unknown })
      : {};
  const legacyFontSize =
    typeof candidate.fontScale === "number"
      ? candidate.fontScale * 16
      : DEFAULT_SETTINGS.fontSize;

  return {
    mode: isReaderMode(candidate.mode)
      ? candidate.mode
      : DEFAULT_SETTINGS.mode,
    theme: isReaderTheme(candidate.theme)
      ? candidate.theme
      : DEFAULT_SETTINGS.theme,
    fontSize:
      typeof candidate.fontSize === "number"
        ? clamp(candidate.fontSize, 14, 20)
        : clamp(legacyFontSize, 14, 20),
    lineHeight:
      typeof candidate.lineHeight === "number"
        ? clamp(candidate.lineHeight, 1.6, 2.2)
        : DEFAULT_SETTINGS.lineHeight,
    wide:
      typeof candidate.wide === "boolean"
        ? candidate.wide
        : DEFAULT_SETTINGS.wide,
  };
}

function readLocalSettings() {
  const storedValue =
    window.localStorage.getItem(LOCAL_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!storedValue) {
    return DEFAULT_SETTINGS;
  }

  try {
    return normalizeSettings(JSON.parse(storedValue));
  } catch {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return DEFAULT_SETTINGS;
  }
}

function writeLocalSettings(settings: ReaderSettings) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function useReaderSettings(userId?: string | null) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hydratedUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSettings() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      const localSettings = readLocalSettings();

      setSettings(localSettings);
      setIsReady(false);
      hydratedUserId.current = undefined;

      if (!userId) {
        hydratedUserId.current = null;
        setIsReady(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "reader_theme, reader_font_size, reader_line_height, reader_mode, reader_wide",
        )
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Supabase preferences fetch failed:", error);
      }

      const cloudSettings = data
        ? normalizeSettings({
            mode: data.reader_mode ?? localSettings.mode,
            theme: data.reader_theme ?? localSettings.theme,
            fontSize: data.reader_font_size ?? localSettings.fontSize,
            lineHeight: Number(data.reader_line_height) || localSettings.lineHeight,
            wide:
              typeof data.reader_wide === "boolean"
                ? data.reader_wide
                : localSettings.wide,
          })
        : localSettings;

      setSettings(cloudSettings);
      writeLocalSettings(cloudSettings);
      hydratedUserId.current = userId;
      setIsReady(true);
    }

    void hydrateSettings();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateSettings = useCallback(
    (newFields: Partial<ReaderSettings>) => {
      setSettings((currentSettings) => {
        const nextSettings = normalizeSettings({
          ...currentSettings,
          ...newFields,
        });

        writeLocalSettings(nextSettings);
        return nextSettings;
      });
    },
    [],
  );

  useEffect(() => {
    if (!userId || !isReady || hydratedUserId.current !== userId) {
      return;
    }

    let cancelled = false;
    const syncTimer = window.setTimeout(async () => {
      setIsSyncing(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          reader_theme: settings.theme,
          reader_font_size: settings.fontSize,
          reader_line_height: settings.lineHeight,
          reader_mode: settings.mode,
          reader_wide: settings.wide,
        })
        .eq("id", userId);

      if (error) {
        console.error("Supabase preferences sync failed:", error);
      }

      if (!cancelled) {
        setIsSyncing(false);
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(syncTimer);
    };
  }, [isReady, settings, userId]);

  return { settings, updateSettings, isSyncing, isReady };
}
