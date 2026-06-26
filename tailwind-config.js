/**
 * tailwind-config.js — SGCC Tailwind CSS Theme Configuration
 * ─────────────────────────────────────────────────────────────
 * This file is loaded BEFORE Tailwind (via CDN) processes the HTML.
 * It extends Tailwind's default theme with SGCC's custom design system.
 *
 * Design System Overview:
 * ──────────────────────
 *  • Colors  → All colors point to CSS custom properties (--color-*)
 *              defined in style.css. This allows the dark/light theme
 *              to be switched by simply toggling the .dark class on <html>.
 *
 *  • Radius  → Intentionally small/square corners for the tech/cyberpunk
 *              aesthetic. Default Tailwind's rounded-xl etc. are overridden.
 *
 *  • Fonts   → Three distinct font roles:
 *              - headline : Sora        → Titles, buttons, labels
 *              - body     : Inter       → Paragraphs, descriptions
 *              - label    : Space Grotesk → Tags, badges, small caps
 */
tailwind.config = {
    // Use the CSS class ".dark" on <html> to activate dark mode.
    // This is controlled by theme.js at runtime.
    darkMode: "class",

    theme: {
        extend: {
            /**
             * Color Tokens
             * All values reference CSS variables so they automatically
             * update when the .dark class is added or removed.
             * The actual color values are defined in style.css.
             */
            "colors": {
                // ── Page-level surfaces ──
                "background":                "var(--color-background)",
                "on-background":             "var(--color-on-background)",

                // ── Card and container surfaces (ordered low to high elevation) ──
                "surface":                   "var(--color-surface)",
                "surface-dim":               "var(--color-surface-dim)",
                "surface-bright":            "var(--color-surface-bright)",
                "surface-container-lowest":  "var(--color-surface-container-lowest)",
                "surface-container-low":     "var(--color-surface-container-low)",
                "surface-container":         "var(--color-surface-container)",
                "surface-container-high":    "var(--color-surface-container-high)",
                "surface-container-highest": "var(--color-surface-container-highest)",

                // ── Text and icon colors ──
                "on-surface":                "var(--color-on-surface)",
                "on-surface-variant":        "var(--color-on-surface-variant)",

                // ── Borders and dividers ──
                "outline":                   "var(--color-outline)",
                "outline-variant":           "var(--color-outline-variant)",

                // ── Primary brand color (neon pink/magenta) ──
                "primary":                   "var(--color-primary)",
                "on-primary":                "var(--color-on-primary)",
                "primary-container":         "var(--color-primary-container)",
                "on-primary-container":      "var(--color-on-primary-container)",

                // ── Secondary accent color (neon cyan/teal) ──
                "secondary":                 "var(--color-secondary)",
                "on-secondary":              "var(--color-on-secondary)",
                "secondary-container":       "var(--color-secondary-container)",
                "on-secondary-container":    "var(--color-on-secondary-container)",

                // ── Tertiary accent color (neon yellow/gold) ──
                "tertiary":                  "var(--color-tertiary)",
                "on-tertiary":               "var(--color-on-tertiary)",
                "tertiary-container":        "var(--color-tertiary-container)",
                "on-tertiary-container":     "var(--color-on-tertiary-container)",

                // ── Error/danger state color ──
                "error":                     "var(--color-error)",
                "on-error":                  "var(--color-on-error)",
                "error-container":           "var(--color-error-container)",
                "on-error-container":        "var(--color-on-error-container)"
            },

            /**
             * Border Radius Overrides
             * Using small values gives the site a sharp, tech/industrial look.
             * Note: "full" maps to 0.75rem instead of 9999px to keep pill shapes subtle.
             */
            "borderRadius": {
                "DEFAULT": "0.125rem",
                "lg":      "0.25rem",
                "xl":      "0.5rem",
                "full":    "0.75rem"
            },

            /**
             * Font Family Roles
             * Each font serves a specific typographic role across all pages.
             */
            "fontFamily": {
                "headline": ["Sora"],          // Bold titles, CTAs, navigation labels
                "display":  ["Sora"],          // Hero display text (same as headline)
                "body":     ["Inter"],         // Body copy, descriptions, form text
                "label":    ["Space Grotesk"]  // Badges, filter chips, table headers
            },

            /**
             * Global Layout Expansion
             * Redefining 7xl (default 1280px) to 1536px (matches max-w-screen-2xl).
             * This expands all main container grids globally to gracefully utilize modern desktop monitors.
             */
            "maxWidth": {
                "7xl": "1536px"
            }
        },
    },
}
