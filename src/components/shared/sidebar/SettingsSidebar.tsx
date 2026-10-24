import { Link, useLocation } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { settingsMenuLinks } from "@/constants/sidebarLinks";

export function SettingsSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="lg:w-1/5">
      <SidebarGroup className="p-0">
        <SidebarMenu className="flex-row flex-wrap gap-2 lg:flex-col">
          {settingsMenuLinks.map((menuLink) => (
            <SidebarMenuItem key={menuLink.path}>
              <SidebarMenuButton
                isActive={pathname === menuLink.path}
                tooltip={menuLink.title}
                render={
                  <Link to={menuLink.path}>
                    <span className="truncate">{menuLink.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </aside>
  );
}
