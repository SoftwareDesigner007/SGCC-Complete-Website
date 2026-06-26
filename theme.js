/**
 * theme.js — SGCC Dark/Light Theme Manager
 * ─────────────────────────────────────────
 * Runs BEFORE the page renders (loaded in <head>) so the correct
 * theme is applied immediately, preventing a flash of wrong theme.
 *
 * How it works:
 *  1. On first visit → checks current hour; night time = dark, day = light.
 *  2. On return visits → reads the saved preference from localStorage.
 *  3. The #theme-toggle button (in every page's nav) switches the theme.
 */
(function () {

    /**
     * Apply or remove the "dark" class on <html>.
     * Also saves the choice to localStorage so it persists across visits.
     * @param {boolean} isDark - true to enable dark mode, false for light mode
     */
    function setTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    /**
     * Decide which theme to start with.
     * Priority: saved preference > automatic time-based default.
     */
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            // User has previously chosen a theme — respect that choice.
            setTheme(savedTheme === 'dark');
        } else {
            // No saved preference — use daytime (6 AM–6 PM) = light, else dark.
            const hour = new Date().getHours();
            const isDayTime = hour >= 6 && hour < 18;
            setTheme(!isDayTime);
        }
    }

    // Apply theme immediately on script load (before DOM is ready).
    initTheme();

    // Once the DOM is ready, wire up the toggle button on this page.
    document.addEventListener('DOMContentLoaded', () => {
        // Select all theme toggle buttons (some pages may have multiple).
        const toggleBtns = document.querySelectorAll('#theme-toggle');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Flip the current theme on every click.
                const isDark = document.documentElement.classList.contains('dark');
                setTheme(!isDark);
            });
        });
    });

})();
