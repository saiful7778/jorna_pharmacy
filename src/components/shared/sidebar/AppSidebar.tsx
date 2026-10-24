import { SidebarLogo } from "@/components/SidebarLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";

import { SidebarFooterMenu } from "./SidebarFooterMenu";
import { SidebarMainMenu } from "./SidebarMainMenu";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu className="gap-2">
          <SidebarLogo />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMainMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
