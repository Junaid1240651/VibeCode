import Image from "next/image";
import { useEffect, useState } from "react";

const ShimerMessage = () => {
    const messages = [
        "Analyzing your request...",
        "Planning the architecture...",
        "Writing code...",
        "Creating components...",
        "Setting up dependencies...",
        "Configuring the project...",
        "Building the interface...",
        "Optimizing performance...",
        "Adding final touches...",
        "Almost ready...",
    ]
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 2500); // Slightly slower for better readability
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex items-center gap-3">
            {/* Loading spinner */}
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            
            {/* Loading message */}
            <div className="bg-muted/50 px-3 py-2 rounded-lg border">
                <span className="text-sm text-muted-foreground animate-pulse">
                    {messages[currentMessageIndex]}
                </span>
            </div>
        </div>
    );
}

export const MessageLoading = () => {
    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center pl-2 mb-2">
                <Image
                    src="/logo.png"
                    alt="logo"
                    width={50}
                    height={50}
                    className="shrink-0 rounded-full"
                />
                <span className="text-sm font-medium pr-2">
                    Vibe Code
                </span>
                <span className="text-xs text-muted-foreground">
                    is working...
                </span>
            </div>
            <div className="pl-8 flex flex-col gap-y-4">
                <ShimerMessage />
                
                {/* Simple loading div as requested */}
                <div className="bg-background/50 border border-dashed border-muted-foreground/30 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground text-center">
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    )
}