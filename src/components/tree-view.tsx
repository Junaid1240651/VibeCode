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

interface TreeViewProps {
    data: TreeItem[];
    value?: string | null;
    onSelect?: (value: string) => void;
}

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

interface TreeProps {
    item: TreeItem;
    selectValue?: string | null;
    onSelect?: (value: string) => void;
    parrentPath: string;
}

const Tree = ({ item, selectValue, onSelect, parrentPath }: TreeProps) => {
    const [name, ...items] = Array.isArray(item) ? item : [item];
    const currentPath = parrentPath ? `${parrentPath}/${name}` : name;

    // If item is a string or array with no children, it's a file
    if (!Array.isArray(item) || items.length === 0) {
        //It's a file
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
    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collasible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRightCircleIcon className="transition-transform" />
                        <FolderIcon />
                        <span className="truncate">{name}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
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
