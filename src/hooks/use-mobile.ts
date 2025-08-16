/**
 * Mobile Detection Hook
 * 
 * A custom React hook that provides responsive mobile device detection
 * using the matchMedia API. Tracks screen size changes and provides
 * real-time mobile state for responsive UI components.
 * 
 * Key Features:
 * - Real-time mobile detection with 768px breakpoint
 * - Automatic updates on screen resize
 * - SSR-safe with undefined initial state
 * - Event listener cleanup for performance
 * - Based on standard mobile breakpoint conventions
 */

import * as React from "react"

/** 
 * Mobile breakpoint threshold in pixels
 * Screens below this width are considered mobile devices
 */
const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile Hook
 * 
 * Detects whether the current viewport is below the mobile breakpoint.
 * Provides responsive state management for mobile-specific UI behavior.
 * 
 * Behavior:
 * - Returns undefined during SSR/initial render for hydration safety
 * - Automatically updates when screen size changes
 * - Uses matchMedia API for efficient resize monitoring
 * - Cleans up event listeners on component unmount
 * 
 * @returns boolean indicating if viewport is mobile-sized (< 768px)
 * 
 * @example
 * const MyComponent = () => {
 *   const isMobile = useIsMobile();
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileMenu /> : <DesktopMenu />}
 *     </div>
 *   );
 * };
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler for media query changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set up listener and initial state
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return boolean, converting undefined to false
  return !!isMobile
}
