import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Fragment } from "@/generated/prisma";
import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: Fragment
}

export const FragmentWeb = ({ data }: Props) => {
    const [fragmentKey, setFragmentKey] = useState<number>(0);
    const [copied, setCopied] = useState<boolean>(false);

    const oneRefresh = ( ) => {
        setFragmentKey((prev)=> prev+1);
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            variant={"outline"}
                            onClick={oneRefresh}
                        >
                            <RefreshCwIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Refresh
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            variant={"outline"}
                            onClick={copyToClipboard}
                            disabled={!data.sandboxURL || copied}
                            className="flex-1 justify-start text-start font-normal"
                        >
                            <span className="truncate">
                                {data.sandboxURL}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Click to copy URL
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            disabled={!data.sandboxURL}
                            variant="outline"
                            onClick={() => { 
                                if (!data.sandboxURL) return;
                                window.open(data.sandboxURL, "_blank");
                            }}
                        >
                            <ExternalLinkIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Open in new tab
                    </TooltipContent>
                </Tooltip>
                </div>
            <iframe
                    key={fragmentKey}
                    className="h-full w-full"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    loading="lazy"
                    src={data.sandboxURL}
                />
            </div>
    )
};
    