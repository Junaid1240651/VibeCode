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

type FileCollection = { [path: string]: string };

function getLanguageFromExtension(filename: string): string {
  const extension = filename?.split(".")?.pop()?.toLowerCase();
  return extension || "text";
}

interface FileBreakcrumbProps {
  filePath: string;
}
const FileBreakcrumb = ({ filePath }: FileBreakcrumbProps) => {
  const pathSegments = filePath.split("/");
  const maxSegments = 5;
  const renderBreadcrumbItem = () => {
    if (pathSegments.length <= maxSegments) {
      // show all segment if less than maxSegments
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
      const firstSegments = pathSegments[0];
      const lastSegments = pathSegments[pathSegments.length - 1];
        console.log(firstSegments);
        console.log(lastSegments);
        
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

interface FileExplorerProps {
  files: FileCollection;
}
export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = React.useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });
  const [copied,setCopied] = React.useState(false);
  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handlefileSelect = useCallback(
    (filePath: string) => {
      console.log(filePath);

      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files]
  );
    
    const handleCopied = useCallback(() => {
    if(selectedFile){
        navigator.clipboard.writeText(files[selectedFile]);
        setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
        
    },[selectedFile,files]);  
     

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handlefileSelect}
        />
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors" />
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
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
                  {copied ? <CopyCheckIcon/> : <CopyIcon />}
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <p>Select a file to view</p>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
