'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { MessageContiner } from "../components/messages-container"
import { Suspense } from "react"

interface Props {
    projectId: string
}
export const ProjectView = ({ projectId }: Props) => {
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={25}
                    minSize={25}
                    className="flex flex-col min-h-0"
                >
                    <Suspense fallback={<div>Loading...</div>}>
                        <MessageContiner projectId={projectId} />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                    className="flex flex-col min-h-0"
                >
                    {/* <h1>{JSON.stringify(messages)}</h1> */}

                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
