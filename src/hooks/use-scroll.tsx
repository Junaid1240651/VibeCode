/**
 * Scroll Detection Hook
 * 
 * A custom React hook that tracks scroll position and provides boolean state
 * indicating whether the user has scrolled past a specified threshold.
 * Useful for implementing scroll-triggered UI changes like sticky headers,
 * scroll-to-top buttons, or navigation bar styling.
 * 
 * Key Features:
 * - Configurable scroll threshold
 * - Automatic event listener management
 * - Performance optimized with cleanup
 * - Initial state detection on mount
 * - Cross-browser compatible
 */

import { useEffect, useState } from "react"

/**
 * useScroll Hook
 * 
 * Monitors scroll position and returns boolean state indicating whether
 * the user has scrolled past the specified threshold.
 * 
 * Behavior:
 * - Returns true when scrollY > threshold
 * - Returns false when scrollY <= threshold
 * - Automatically sets initial state on mount
 * - Cleans up event listeners on unmount
 * 
 * @param threshold - Scroll position threshold in pixels (default: 10)
 * @returns boolean indicating if scroll position exceeds threshold
 * 
 * @example
 * const Header = () => {
 *   const hasScrolled = useScroll(100);
 *   
 *   return (
 *     <header className={hasScrolled ? 'scrolled' : 'top'}>
 *       <nav>Navigation</nav>
 *     </header>
 *   );
 * };
 * 
 * @example
 * // Scroll-to-top button
 * const ScrollToTop = () => {
 *   const showButton = useScroll(200);
 *   
 *   if (!showButton) return null;
 *   
 *   return (
 *     <button onClick={() => window.scrollTo(0, 0)}>
 *       Back to Top
 *     </button>
 *   );
 * };
 */
export const useScroll = (threshold = 10) => {
    const [scroll, setScroll] = useState(false)
    
    useEffect(() => {
        /**
         * Scroll event handler that updates state based on threshold
         */
        const handleScroll = () => {
            if (window.scrollY > threshold) {
                setScroll(true)
            } else {
                setScroll(false)
            }
        }
        
        // Add scroll listener
        window.addEventListener('scroll', handleScroll)
        
        // Set initial state based on current scroll position
        handleScroll();
        
        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [threshold])
    
    return scroll
}