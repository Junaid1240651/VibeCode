/**
 * Hint (Tooltip) Component
 * 
 * A reusable tooltip component that provides contextual information on hover.
 * Built using Shadcn/UI Tooltip components for consistent styling and behavior.
 * 
 * Key Features:
 * - Customizable positioning (top, bottom, left, right)
 * - Flexible alignment options (start, center, end)
 * - Accessible tooltip implementation
 * - Hover and focus trigger support
 */

'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

/**
 * Props for the Hint component
 */
interface HintProps {
    children: React.ReactNode;      // The element that triggers the tooltip
    text: string;                   // The tooltip text content
    side?: 'top' | 'bottom' | 'left' | 'right';  // Tooltip position
    align?: 'start' | 'center' | 'end';          // Tooltip alignment
}

/**
 * Hint Component
 * 
 * Wraps any child element with a tooltip that appears on hover.
 * Useful for providing additional context or help text for UI elements.
 * 
 * @param children - The element that will trigger the tooltip
 * @param text - The text to display in the tooltip
 * @param side - Position of the tooltip relative to the trigger (default: 'top')
 * @param align - Alignment of the tooltip (default: 'center')
 * 
 * @example
 * <Hint text="Click to save your changes" side="bottom">
 *   <Button>Save</Button>
 * </Hint>
 */
export const Hint = ({ children, text, side = 'top', align = 'center' }: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                {/* Trigger element - the child component */}
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                
                {/* Tooltip content with specified positioning */}
                <TooltipContent side={side} align={align}>
                    <p>{text}</p>
                </TooltipContent> 
            </Tooltip>
        </TooltipProvider>
    )
}