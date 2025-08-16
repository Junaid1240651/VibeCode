/**
 * Utility Functions
 * 
 * This file contains shared utility functions used throughout the application.
 * These functions provide common functionality for styling, data transformation, and more.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type TreeItem } from "../types";

/**
 * Class Name Utility Function
 * 
 * Combines multiple class names and handles Tailwind CSS conflicts intelligently.
 * Uses clsx for conditional classes and tailwind-merge for conflict resolution.
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged and optimized class string
 * 
 * Example:
 * cn("px-4", "px-2") → "px-2" (tailwind-merge resolves conflict)
 * cn("text-red-500", isError && "text-red-700") → conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * File Tree Converter
 * 
 * Converts a flat record of file paths to a hierarchical tree structure
 * for use with the TreeView component in the file explorer.
 * 
 * @param files - Record of file paths to content (e.g., {"src/Button.tsx": "..."})
 * @returns Tree structure for TreeView component
 *
 * @example
 * Input: { "src/Button.tsx": "...", "README.md": "..." }
 * Output: [["src", "Button.tsx"], "README.md"]
 * 
 * Algorithm:
 * 1. Create a tree structure from file paths
 * 2. Build nodes for directories and files
 * 3. Convert to TreeItem format for UI consumption
 */
export function convertFilesToTreeItems(
  files: Record<string, string>
): TreeItem[] {
  
  /**
   * Internal tree node structure for building the hierarchy
   */
  interface TreeNode {
    [key: string]: TreeNode | null;
  }
  
  const tree: TreeNode = {};

  // Sort paths to ensure consistent ordering
  const sortedPaths = Object.keys(files).sort()

  // Build the tree structure from file paths
  for (const filePath of sortedPaths) {
    const parts = filePath.split('/');
    let current = tree;

    // Navigate through directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as TreeNode;
    }
    
    // Mark the file (leaf node)
    const fileName = parts[parts.length - 1];
    current[fileName] = null;
  }

  /**
   * Convert tree node structure to TreeItem format
   * 
   * @param node - Tree node to convert
   * @param name - Optional name for the current node
   * @returns TreeItem or array of TreeItems
   */
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);

    // Handle empty nodes (files)
    if(entries.length === 0) {
      return name || '';
    }
    
    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        // This is a file (leaf node)
        children.push(key);
      } else {
        // This is a folder (branch node)
        const subTree = convertNode(value);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return children;
  }

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}
