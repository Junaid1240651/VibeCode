import { Card } from "@/components/ui/card"
import { Fragment, MessageRole, MessageType } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ChevronRightIcon, Code2Icon, ZoomInIcon, XIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface UserMessageProps {
    content: string
    images?: string[]
}

interface AssistantMessageProps {
    content: string
    fragment: Fragment | null
    createdAt: Date
    isActiveFragment: boolean
    onFragmentClick: (fragment: Fragment) => void
    type: MessageType
    images?: string[]
}

interface FragmentCardProps {
    fragment: Fragment
    isActiveFragment: boolean
    onFragmentClick: (fragment: Fragment) => void
}

const FragmentCard = ({
    fragment,
    isActiveFragment,
    onFragmentClick
}: FragmentCardProps) => {
    return (
        <button className={
            cn(
                'flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors',
                isActiveFragment &&
                'bg-primary text-primary-foreground border-primary hover:bg-primary'
            )
        }
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className=" flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">{fragment.title}</span>
                <span className="text-sm">preview</span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRightIcon className="size-4" />
            </div>
        </button>
    )
}

const AssistantMessage = ({
    content,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
    images
}: AssistantMessageProps) => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    return (
        <>
            <div className={cn(
                "flex flex-col group px-2 pb-4",
                type === 'ERROR' && 'text-red-700 dark:text-red-500'
            )}>
                <div className="flex items-center pl-2 mb-2">
                    <Image
                        src='/logo.png'
                        alt="Vibe Code"
                        width={50}
                        height={50}
                        className="shrink-0 rounded-full"
                    />
                    <span className="text-sm font-medium pr-2">Vibe Code</span>
                    <span className="text-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"> 
                        {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
                    </span>
                </div>
                <div className="pl-8 flex flex-col gap-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
                    </div>
                    
                    {images && images.length > 0 && (
                        <div className="space-y-2">
                            <div className={cn(
                                "grid gap-2",
                                images.length === 1 && "grid-cols-1 max-w-xs",
                                images.length === 2 && "grid-cols-2 max-w-md",
                                images.length >= 3 && "grid-cols-2 sm:grid-cols-3 max-w-lg"
                            )}>
                                {images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-background/50"
                                        onClick={() => setSelectedImage({ src: image, alt: `AI Image ${index + 1}` })}
                                    >
                                        <Image
                                            src={image}
                                            alt={`AI generated ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="w-full h-24 sm:h-32 object-cover transition-all duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                            <ZoomInIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {fragment && type === 'RESULT' && (
                        <FragmentCard
                            fragment={fragment}
                            isActiveFragment={isActiveFragment}
                            onFragmentClick={onFragmentClick}
                        />
                    )}
                </div>
            </div>
            
            <ImageModal
                src={selectedImage?.src || ""}
                alt={selectedImage?.alt || ""}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    )
}

const ImageModal = ({ 
    src, 
    alt, 
    isOpen, 
    onClose 
}: { 
    src: string; 
    alt: string; 
    isOpen: boolean; 
    onClose: () => void; 
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 p-0"
                    onClick={onClose}
                >
                    <XIcon className="h-4 w-4" />
                </Button>
                <Image
                    src={src}
                    alt={alt}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

const UserMessage = ({
    content,
    images
}: UserMessageProps) => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    return (
        <>
            <div className="flex justify-end pb-4 pr-2 pl-10">
                <Card className="rounded-lg bg-muted p-4 shadow-none border-none max-w-[80%] break-words">
                    <p className="text-sm leading-relaxed">{content}</p>
                    {images && images.length > 0 && (
                        <div className="space-y-2">
                            <div className={cn(
                                "grid gap-2",
                                images.length === 1 && "grid-cols-1",
                                images.length === 2 && "grid-cols-2",
                                images.length >= 3 && "grid-cols-2 sm:grid-cols-3"
                            )}>
                                {images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-background/50"
                                        onClick={() => setSelectedImage({ src: image, alt: `Image ${index + 1}` })}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Uploaded ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="w-full h-24 sm:h-32 object-cover transition-all duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                            <ZoomInIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {images.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                    {images.length} images • Click to view full size
                                </p>
                            )}
                        </div>
                    )}
                </Card>
            </div>
            
            <ImageModal
                src={selectedImage?.src || ""}
                alt={selectedImage?.alt || ""}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    )
}
interface MessageCardProps {
    content: string
    role: MessageRole
    fragment: Fragment | null
    createdAt: Date
    isActiveFragment: boolean
    onFragmentClick: (fragment: Fragment) => void
    type: MessageType
    images?: string[]
}

export const MessageCard = ({
    content,
    role,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
    images
}: MessageCardProps) => {
    if (role === 'ASSISTANT') {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type}
                images={images}
            />
        )
    }
    return (
        <UserMessage
            content={content}
            images={images}
        />
    )
}