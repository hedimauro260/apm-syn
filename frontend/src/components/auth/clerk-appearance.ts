import { useMemo } from "react";
import type { ComponentProps } from "react";
import { SignIn } from "@clerk/clerk-react";

export type ClerkAppearance = NonNullable<ComponentProps<typeof SignIn>["appearance"]>;

interface ThemeTokens {
  colorScheme: "light" | "dark";
  background: string;
  surface: string;
  surfaceElevated: string;
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  border: string;
  primary: string;
  primaryHover: string;
  danger: string;
  success: string;
}

function isDarkMode(): boolean {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function resolveTokens(): ThemeTokens {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    colorScheme: isDarkMode() ? "dark" : "light",
    background: read("--color-background", "#f8fafc"),
    surface: read("--color-surface", "#ffffff"),
    surfaceElevated: read("--color-surface-elevated", "#ffffff"),
    foreground: read("--color-foreground", "#0f172a"),
    foregroundSecondary: read("--color-foreground-secondary", "#475569"),
    foregroundMuted: read("--color-foreground-muted", "#94a3b8"),
    border: read("--color-border", "#e2e8f0"),
    primary: read("--color-primary", "#3b82f6"),
    primaryHover: read("--color-primary-hover", "#1d4ed8"),
    danger: read("--color-danger", "#dc2626"),
    success: read("--color-success", "#16a34a"),
  };
}

const FONT_FAMILY = "Inter, ui-sans-serif, system-ui, sans-serif";
const FONT_DISPLAY = `"Space Grotesk", sans-serif`;

export function useClerkAppearance(): ClerkAppearance {
  return useMemo(() => {
    const t = resolveTokens();

    return {
      variables: {
        colorScheme: t.colorScheme,
        colorBackground: t.surface,
        colorInputBackground: t.background,
        colorText: t.foreground,
        colorInputText: t.foreground,
        colorPrimary: t.primary,
        colorBorder: t.border,
        colorDanger: t.danger,
        colorSuccess: t.success,
        colorSecondary: t.foregroundSecondary,
        borderRadius: "0.75rem",
        fontFamily: FONT_FAMILY,
        fontFamilyButtons: FONT_FAMILY,
        fontSize: "0.875rem",
        fontSizeMedium: "0.875rem",
        fontSizeSmall: "0.8125rem",
      },
      elements: {
        rootBox: {
          width: "100%",
        },
        card: {
          boxShadow:
            "0 20px 45px -15px rgba(2, 6, 23, 0.18), 0 4px 12px -6px rgba(2, 6, 23, 0.12)",
          border: `1px solid ${t.border}`,
          borderRadius: "0.85rem",
          backgroundColor: t.surface,
          width: "100%",
        },
        header: {
          padding: "1.75rem 1.75rem 0.25rem",
        },
        headerTitle: {
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: "1.5rem",
          letterSpacing: "-0.02em",
          color: t.foreground,
        },
        headerSubtitle: {
          color: t.foregroundSecondary,
          fontSize: "0.875rem",
          marginTop: "0.4rem",
        },
        formField: { paddingLeft: "1.75rem", paddingRight: "1.75rem" },
        formFieldLabel: {
          color: t.foregroundSecondary,
          fontWeight: 500,
          fontSize: "0.8125rem",
        },
        formFieldLabelRow: { marginBottom: "0.4rem" },
        formFieldInput: {
          backgroundColor: t.background,
          border: `1px solid ${t.border}`,
          borderRadius: "0.5rem",
          color: t.foreground,
          fontSize: "0.875rem",
          padding: "0.625rem 0.75rem",
          boxShadow: "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        },
        formFieldInputShowPasswordButton: { color: t.foregroundMuted },
        formFieldInputSection__showPassword: { backgroundColor: "transparent" },
        formButtonPrimary: {
          backgroundColor: t.primary,
          borderRadius: "0.5rem",
          fontWeight: 600,
          height: "2.75rem",
          fontSize: "0.875rem",
          transition: "background-color 150ms ease, transform 150ms ease",
        },
        formButtonPrimary__loading: { backgroundColor: t.primaryHover },
        formButtonReset: {
          color: t.primary,
          fontWeight: 600,
        },
        formFieldErrorText: { color: t.danger, fontSize: "0.75rem" },
        formFieldError: { borderColor: t.danger },
        socialButtonsBlockButton: {
          backgroundColor: t.background,
          border: `1px solid ${t.border}`,
          borderRadius: "0.5rem",
          color: t.foreground,
          fontWeight: 500,
          fontSize: "0.875rem",
          height: "2.5rem",
          transition: "background-color 150ms ease",
        },
        alternativeMethodsBlockButton: {
          backgroundColor: t.background,
          border: `1px solid ${t.border}`,
          borderRadius: "0.5rem",
          color: t.foreground,
          fontWeight: 500,
          fontSize: "0.875rem",
          height: "2.5rem",
        },
        dividerLine: { borderColor: t.border },
        dividerText: { color: t.foregroundMuted, fontSize: "0.8125rem" },
        footer: { padding: "1rem 1.75rem 1.75rem" },
        footerAction: { color: t.foregroundSecondary, fontWeight: 500 },
        footerActionLink: {
          color: t.primary,
          fontWeight: 600,
        },
        footerActionText: { color: t.foregroundSecondary },
        formResendCodeLink: {
          color: t.primary,
          fontWeight: 600,
          fontSize: "0.875rem",
        },
        alert: {
          backgroundColor: `${t.danger}11`,
          border: `1px solid ${t.danger}33`,
          color: t.danger,
          borderRadius: "0.5rem",
          fontWeight: 500,
        },
        identityPreviewText: { color: t.foreground },
        identityPreviewEditButton: { color: t.primary },
        otpCodeFieldInput: {
          border: `1px solid ${t.border}`,
          backgroundColor: t.background,
          color: t.foreground,
          borderRadius: "0.5rem",
        },
      },
    };
  }, []);
}