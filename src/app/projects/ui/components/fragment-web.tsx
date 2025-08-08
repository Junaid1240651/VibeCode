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
      <iframe
        key={fragmentKey}
        className="h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
        src={data.sandboxURL}
      />
    </div>
  );
};
