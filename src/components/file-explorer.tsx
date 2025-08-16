/**
 * File Explorer Component
 * 
 * A comprehensive file navigation and viewing interface that provides a dual-pane
 * experience with a tree view for file navigation and a code viewer for content display.
 * 
 * Key Features:
 * - Resizable panels for customizable layout
 * - Interactive file tree navigation
 * - Syntax-highlighted code viewer
 * - File breadcrumb navigation
 * - Copy-to-clipboard functionality
 * - Responsive design with minimum panel sizes
 * 
 * Architecture:
 * - Left panel: File tree navigation (30% default, 30% minimum)
 * - Right panel: Code viewer with breadcrumbs (70% default, 50% minimum)
 * - Resizable divider between panels
 */

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { Hint } from "@/components/hint";
import { CodeView } from "@/components/code-view";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbEllipsis,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { Fragment, useCallback, useMemo } from "react";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";

/**
 * Type definition for file collection
 * Maps file paths to their string content
 */
type FileCollection = { [path: string]: string };

/**
 * Determines the programming language from file extension
 * 
 * @param filename - The filename to analyze
 * @returns The detected language identifier for syntax highlighting
 * 
 * @example
 * getLanguageFromExtension("app.tsx") // returns "tsx"
 * getLanguageFromExtension("style.css") // returns "css"
 */
function getLanguageFromExtension(filename: string): string {
  const extension = filename?.split(".")?.pop()?.toLowerCase();
  return extension || "text";
}

/**
 * Props for FileBreakcrumb component
 */
interface FileBreakcrumbProps {
  filePath: string;
}

/**
 * FileBreakcrumb Component
 * 
 * Displays a breadcrumb navigation for the currently selected file path.
 * Automatically truncates long paths to improve readability by showing
 * only the first and last segments with ellipsis in between.
 * 
 * Features:
 * - Smart path truncation for long file paths
 * - Highlights the current file name
 * - Responsive breadcrumb navigation
 * 
 * @param filePath - The full path of the selected file
 */
const FileBreakcrumb = ({ filePath }: FileBreakcrumbProps) => {
  const pathSegments = filePath.split("/");
  const maxSegments = 5;
  
  /**
   * Renders breadcrumb items with smart truncation
   * Shows all segments if path is short, otherwise shows first...last pattern
   */
  const renderBreadcrumbItem = () => {
    if (pathSegments.length <= maxSegments) {
      // Show all segments if path is short enough
      return pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      // Show truncated path: first ... last for long paths
      const firstSegments = pathSegments[0];
      const lastSegments = pathSegments[pathSegments.length - 1];
        
      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegments}</span>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium!">
                {lastSegments}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbItem>
        </>
      );
    }
  };
  
  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItem()}</BreadcrumbList>
    </Breadcrumb>
  );
};

/**
 * Props for FileExplorer component
 */
interface FileExplorerProps {
  files: FileCollection;
}

/**
 * FileExplorer Component
 * 
 * The main file explorer interface providing a comprehensive file navigation
 * and viewing experience with resizable panels.
 * 
 * Core Features:
 * - Dual-pane layout with resizable panels
 * - File tree navigation on the left
 * - Code viewer with syntax highlighting on the right
 * - File content copying functionality
 * - Breadcrumb navigation for selected files
 * - Auto-selection of first file on load
 * 
 * State Management:
 * - selectedFile: Currently active file path
 * - copied: Copy operation feedback state
 * - treeData: Memoized tree structure for performance
 * 
 * @param files - Collection of file paths mapped to their content
 */
export const FileExplorer = ({ files }: FileExplorerProps) => {
  // Initialize with first available file
  const [selectedFile, setSelectedFile] = React.useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });
  
  // Track copy operation state for user feedback
  const [copied, setCopied] = React.useState(false);
  
  // Memoized tree data structure for performance optimization
  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  /**
   * Handles file selection from the tree view
   * Validates that the selected file exists in the collection
   */
  const handlefileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files]
  );
    
  /**
   * Handles copying selected file content to clipboard
   * Provides visual feedback for successful copy operation
   */
  const handleCopied = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [selectedFile, files]);  
     

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* Left Panel: File Tree Navigation */}
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handlefileSelect}
        />
      </ResizablePanel>
      
      {/* Resizable Handle */}
      <ResizableHandle className="hover:bg-primary transition-colors" />
      
      {/* Right Panel: Code Viewer */}
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            {/* Header with breadcrumb and copy button */}
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              <FileBreakcrumb filePath={selectedFile} />
              <Hint text="Copy to clipboard" side="bottom">
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={handleCopied}
                  disabled={!selectedFile}
                >
                  {copied ? <CopyCheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>
            
            {/* Code content area */}
            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          /* Empty state when no file is selected */
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select a file to view its content</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
