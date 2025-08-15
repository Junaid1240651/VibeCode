import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

interface LoadingProps {
  message?: string;
  className?: string;
  showSpinner?: boolean;
}

export const Loading = ({ 
  message = "Loading...", 
  className,
  showSpinner = true 
}: LoadingProps) => {
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 p-4 text-muted-foreground",
      className
    )}>
      {showSpinner && <Loader2Icon className="h-4 w-4 animate-spin" />}
      <div>{message}</div>
    </div>
  );
};

// Simple loading div as requested
export const SimpleLoading = ({ message = "Loading..." }: { message?: string }) => {
  return <div className="p-4 text-center text-muted-foreground">{message}</div>;
};