
export const ProjectLoading = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Main loading circle */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-primary/30"></div>
        </div>
        
        {/* Loading text */}
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-foreground">Loading Project</h3>
          <p className="text-sm text-muted-foreground">
            Setting up your workspace...
          </p>
        </div>
        
        {/* Animated dots */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
          <span>Please wait</span>
        </div>
      </div>
    </div>
  );
};