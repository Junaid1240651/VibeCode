/**
 * Global Type Definitions
 * 
 * This file contains shared TypeScript types used throughout the application.
 * These types help maintain consistency and type safety across components.
 */

/**
 * TreeItem Type
 * 
 * Represents a file or folder structure for the file tree navigation.
 * Used by the TreeView component to display project files in a hierarchical structure.
 * 
 * Can be either:
 * - A string (representing a file)
 * - A tuple with a string and nested TreeItems (representing a folder with contents)
 * 
 * Examples:
 * - "README.md" (file)
 * - ["src", "index.tsx", "utils.ts"] (folder with files)
 * - ["components", ["ui", "button.tsx"], "header.tsx"] (nested folders)
 */
export type TreeItem = string | [string, ...TreeItem[]];