
/**
 * Project Loading Component
 * 
 * A visually appealing loading screen component used throughout the application
 * to indicate when projects are being loaded or processed.
 * 
 * Key Features:
 * - Animated loading spinner with dual rings
 * - Pulse animations for visual feedback
 * - Bouncing dots for additional loading indication
 * - Consistent with app's design system
 * - Accessible loading state messaging
 */

/**
 * ProjectLoading Component
 * 
 * Displays a full-screen loading interface with animated elements.
 * Used when loading project data, navigating between projects, or during processing.
 * 
 * Visual Elements:
 * - Primary spinning ring with border animation
 * - Secondary pulsing ring for depth
 * - Animated bouncing dots with staggered delays
 * - Clear loading message for accessibility
 * 
 * @example
 * // Used in Suspense fallbacks
 * <Suspense fallback={<ProjectLoading />}>
 *   <ProjectContent />
 * </Suspense>
 */
export const ProjectLoading = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        
        {/* Main loading circle with dual animation */}
        <div className="relative">
          {/* Primary spinning ring */}
          <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
          
          {/* Secondary pulsing ring for visual depth */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-primary/30"></div>
        </div>
        
        {/* Loading text section */}
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-foreground">Loading Project</h3>
          <p className="text-sm text-muted-foreground">
            Setting up your workspace...
          </p>
        </div>
        
        {/* Animated dots for additional visual feedback */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            {/* Three bouncing dots with staggered animation delays */}
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
          {/* Loading status text */}
          <span>Please wait</span>
        </div>
      </div>
    </div>
  );
};