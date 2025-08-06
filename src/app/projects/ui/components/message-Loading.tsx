import Image from "next/image";
import { useEffect, useState } from "react";

const ShimerMessage = () => {
    const messages = [
        "Thinking...",
        "Loading...",
        "Generating...",
        "Analyzing your request...",
        "Building your website...",
        "Crafting components...",
        "Optimizing layout...",
        "Adding final touches...",
        "Almost ready...",

    ]
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        },2000);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-center text-muted-foreground animate-pulse">
                {messages[currentMessageIndex]}
            </span>
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
                    className="shrink-0"
                />
                <span className="text-sm font-medium">
                    Vibe Code
                </span>
            </div>
            <div className="pl-8 flex flex-col gap-y-4">
                <ShimerMessage />
            </div>
        </div>
    )
}