/**
 * Current Theme Hook
 * 
 * A utility hook that provides the actual active theme by resolving
 * the current theme preference including system theme detection.
 * Built on top of next-themes for consistent theme management.
 * 
 * Key Features:
 * - Resolves 'system' theme to actual light/dark value
 * - Returns definitive theme state for UI components
 * - Integrates with next-themes theme provider
 * - Handles system preference detection automatically
 */

import { useTheme } from "next-themes"

/**
 * useCurrentTheme Hook
 * 
 * Provides the resolved current theme by handling the 'system' preference
 * and returning the actual active theme (light or dark).
 * 
 * Theme Resolution:
 * - If theme is explicitly set to 'dark' or 'light', returns that value
 * - If theme is 'system' or undefined, returns the detected system theme
 * - Ensures components always get a definitive theme value
 * 
 * @returns 'light' | 'dark' | undefined - The actual active theme
 * 
 * @example
 * const MyComponent = () => {
 *   const currentTheme = useCurrentTheme();
 *   
 *   return (
 *     <div className={`theme-${currentTheme}`}>
 *       Current theme: {currentTheme}
 *     </div>
 *   );
 * };
 */
export const useCurrentTheme = () => {
    const { theme, systemTheme } = useTheme();
    
    // Return explicit theme if set to light or dark
    if (theme === 'dark' || theme === 'light') return theme;
    
    // Fallback to system theme for 'system' preference or undefined
    return systemTheme;
}