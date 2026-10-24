import { useMemo } from "react";

import { useLocation } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { sidebarMenuLinks } from "@/constants/sidebarLinks";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { NestedMenuItem } from "./NestedMenuItem";
import { filterSidebarMenu } from "./filterSidebarMenu";

export function SidebarMainMenu() {
  "use no memo";
  const { pathname } = useLocation();

  const permissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user);

  const sidebarLinks = useMemo(
    () => filterSidebarMenu(sidebarMenuLinks, permissions, authUser.id),
    [permissions, authUser.id]
  );

  return (
    <>
      {sidebarLinks.map(({ groupName, items }, idx) => (
        <SidebarGroup key={`sidebar-group-${idx}`}>
          {groupName && <SidebarGroupLabel>{groupName}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((menuLink, menuIdx) => (
                <NestedMenuItem
                  pathname={pathname}
                  key={`nav-${idx}-${menuIdx}`}
                  menuLink={menuLink}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
