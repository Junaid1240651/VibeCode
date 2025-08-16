/**
 * User Control Component
 * 
 * A customized user button component that integrates Clerk's UserButton
 * with theme-aware styling and consistent design patterns.
 * 
 * Key Features:
 * - Theme-aware appearance (dark/light mode)
 * - Customized styling to match app design
 * - Optional name display
 * - Integrated user menu and profile management
 */

'use client'

import { useCurrentTheme } from '@/hooks/use-current-theme'
import { UserButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

/**
 * Props for the UserControl component
 */
interface Props {
    showName?: boolean;  // Whether to display the user's name next to the avatar
}

/**
 * UserControl Component
 * 
 * Renders a user button with avatar, menu, and optional name display.
 * Automatically adapts styling based on the current theme (dark/light).
 * 
 * @param showName - Optional flag to display user name alongside avatar
 * 
 * Features:
 * - Dynamic theme adaptation
 * - Custom styling to match app design
 * - Rounded corners for modern appearance
 * - Consistent sizing across the app
 * 
 * @example
 * // Basic user button
 * <UserControl />
 * 
 * // With name display
 * <UserControl showName />
 */
export const UserControl = ({ showName }: Props) => {
    // Get current theme to apply appropriate Clerk theme
    const currentTheme = useCurrentTheme();
    
    return (
        <UserButton
            showName={showName}
            appearance={{
                elements: {
                    // Custom styling for the user button container
                    userButtonBox: 'rounded-md!',           // Rounded container
                    userButtonAvatarBox: ' rounded-md! size 8!',  // Rounded avatar with fixed size
                    userButtonTrigger: 'rounded-md!'        // Rounded trigger button
                },
                // Apply dark theme when in dark mode
                baseTheme: currentTheme === 'dark' ? dark : undefined
            }}
        >
            {/* UserButton content is handled internally by Clerk */}
        </UserButton>
    )
}