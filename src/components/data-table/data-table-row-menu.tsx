import { cn } from "cn";
import { EllipsisVertical } from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DataTableRowMenuProps extends React.PropsWithChildren {
  contentProps?: Omit<
    React.ComponentProps<typeof DropdownMenuContent>,
    "children"
  >;
}

export default function DataTableRowMenu({
  children,
  contentProps,
}: DataTableRowMenuProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={<Button size="icon" variant="outline" />}
            />
          }
        >
          <EllipsisVertical />
        </TooltipTrigger>
        <TooltipContent>
          <p>Row Actions</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        className={cn(contentProps?.className, "w-40")}
        align={contentProps?.align ?? "end"}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
