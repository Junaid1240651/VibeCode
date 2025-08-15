import {Hint} from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Fragment } from "@/generated/prisma";
import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
  const [fragmentKey, setFragmentKey] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const oneRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const copyToClipboard = () => {
    if (!data.sandboxURL) return;
    navigator.clipboard.writeText(data.sandboxURL);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom" align="start">
          <Button size="sm" variant={"outline"} onClick={oneRefresh}>
            <RefreshCwIcon />
          </Button>
        </Hint>
        <Hint text="Click to copy" side="bottom" align="center">
          <Button
            size="sm"
            variant={"outline"}
            onClick={copyToClipboard}
            disabled={!data.sandboxURL || copied}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.sandboxURL}</span>
          </Button>
        </Hint>
        <Hint text="Open in new tab" side="bottom" align="start">
          <Button
            size="sm"
            disabled={!data.sandboxURL}
            variant="outline"
            onClick={() => {
              if (!data.sandboxURL) return;
              window.open(data.sandboxURL, "_blank");
            }}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <div className="relative h-full w-full">
        {!data.sandboxURL || data.sandboxURL.trim() === '' ? (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-primary/30"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Generating Preview</h3>
                <p className="text-sm text-muted-foreground">
                  AI is creating your project. This usually takes 30-60 seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                </div>
                <span>Setting up sandbox environment</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-pulse border-t-primary/30"></div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Loading preview...</div>
                </div>
              </div>
            )}
            <iframe
              key={fragmentKey}
              className="h-full w-full"
              sandbox="allow-scripts allow-same-origin allow-forms"
              loading="lazy"
              src={data.sandboxURL}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};
