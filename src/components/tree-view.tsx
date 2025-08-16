/**
 * Tree View Component
 * 
 * A hierarchical file and folder tree component built with collapsible
 * sidebar structure. Provides an intuitive way to navigate through
 * nested file structures with folder expansion/collapse functionality.
 * 
 * Key Features:
 * - Collapsible folder structures
 * - File selection with active state
 * - Icons for files and folders  
 * - Recursive tree rendering
 * - Path-based selection tracking
 * - Default expanded folders for better UX
 * 
 * Architecture:
 * - Uses ShadCN Sidebar components for consistent styling
 * - Recursive Tree component for nested structures
 * - Collapsible UI for folder management
 */

import { TreeItem } from "@/types";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarRail,
} from "./ui/sidebar";
import { ChevronRightCircleIcon, FileIcon, FolderIcon } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible";

/**
 * Props for TreeView component
 */
interface TreeViewProps {
    /** Array of tree items to display */
    data: TreeItem[];
    /** Currently selected item path */
    value?: string | null;
    /** Callback fired when an item is selected */
    onSelect?: (value: string) => void;
}

/**
 * TreeView Component
 * 
 * Renders a hierarchical tree structure using ShadCN Sidebar components.
 * Handles the top-level tree container and initializes the recursive
 * tree rendering for all root items.
 * 
 * @param data - Array of tree items to render
 * @param value - Currently selected item path
 * @param onSelect - Selection callback function
 */
export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {data.map((item, index) => (
                                    <Tree
                                        key={index}
                                        item={item}
                                        selectValue={value}
                                        onSelect={onSelect}
                                        parrentPath=""
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail></SidebarRail>
            </Sidebar>
        </SidebarProvider>
    );
};

/**
 * Props for Tree component
 */
interface TreeProps {
    /** Tree item to render (can be string or nested array) */
    item: TreeItem;
    /** Currently selected item path */
    selectValue?: string | null;
    /** Callback fired when an item is selected */
    onSelect?: (value: string) => void;
    /** Path of parent directory for building full paths */
    parrentPath: string;
}

/**
 * Tree Component (Internal Recursive)
 * 
 * Recursively renders tree items as either files or folders with children.
 * Handles path construction and provides appropriate UI for each item type.
 * 
 * Item Types:
 * - File: String or array with no children - renders as selectable file
 * - Folder: Array with children - renders as collapsible folder
 * 
 * Features:
 * - Automatic path construction from parent paths
 * - Visual distinction between files and folders
 * - Collapsible folders with rotation animation
 * - Selection state management
 * - Default expanded state for better UX
 * 
 * @param item - Tree item to render
 * @param selectValue - Currently selected path
 * @param onSelect - Selection callback
 * @param parrentPath - Parent directory path for building full paths
 */
const Tree = ({ item, selectValue, onSelect, parrentPath }: TreeProps) => {
    // Extract name and children from the tree item structure
    const [name, ...items] = Array.isArray(item) ? item : [item];
    
    // Build the full path by combining parent path with current name
    const currentPath = parrentPath ? `${parrentPath}/${name}` : name;

    // Handle file items (strings or arrays with no children)
    if (!Array.isArray(item) || items.length === 0) {
        const isSelected = selectValue === currentPath;
        
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={isSelected}
                    className="data=[active=true]:bg-transparent"
                    onClick={() => onSelect?.(currentPath)}
                >
                    <FileIcon />
                    <span className="truncate">{name}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }
    
    // Handle folder items (arrays with children)
    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collasible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
            >
                {/* Folder header with expand/collapse trigger */}
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        {/* Chevron icon with rotation animation */}
                        <ChevronRightCircleIcon className="transition-transform" />
                        <FolderIcon />
                        <span className="truncate">{name}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                
                {/* Collapsible content containing child items */}
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((item, index) => (
                            <Tree
                                key={index}
                                item={item}
                                selectValue={selectValue}
                                onSelect={onSelect}
                                parrentPath={currentPath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
};
