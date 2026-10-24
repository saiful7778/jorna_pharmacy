import { Link, useLocation } from "@tanstack/react-router";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { footerMenuLinks } from "@/constants/sidebarLinks";

export function SidebarFooterMenu() {
  const { pathname } = useLocation();

  return (
    <SidebarMenu>
      {footerMenuLinks.map((menuLink, idx) => (
        <SidebarMenuItem key={`footer-nav-${idx}`}>
          <SidebarMenuButton
            isActive={
              pathname === menuLink.path || pathname.startsWith(menuLink.path)
            }
            tooltip={menuLink.title}
            render={
              <Link to={menuLink.path}>
                {menuLink.icon && menuLink.icon}
                <span>{menuLink.title}</span>
              </Link>
            }
          />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
