import { hasPermission } from "@/features/auth/permission";
import type {
  PermissionType,
  SidebarGroupMenuLinkType,
  SidebarMenuLinkType,
} from "@/types";

export function filterSidebarMenu(
  menuItems: Array<SidebarGroupMenuLinkType>,
  userPermissions: Array<PermissionType>,
  userId: string
): Array<SidebarGroupMenuLinkType> {
  const filteredMenu: Array<SidebarGroupMenuLinkType> = [];

  for (const menuGroup of menuItems) {
    const filteredItems = filterMenuItems(
      menuGroup.items,
      userPermissions,
      userId
    );

    if (filteredItems.length > 0) {
      filteredMenu.push({
        ...menuGroup,
        items: filteredItems,
      });
    }
  }
  return filteredMenu;
}

function filterMenuItems(
  items: Array<SidebarMenuLinkType>,
  userPermissions: Array<PermissionType>,
  userId: string
): Array<SidebarMenuLinkType> {
  const filteredItems: Array<SidebarMenuLinkType> = [];

  for (const menuItem of items) {
    let isAllowed = true;

    if (menuItem.permissions) {
      isAllowed = hasPermission(userPermissions, menuItem.permissions, {
        userId,
      });
    }

    let filteredNestedItems: Array<SidebarMenuLinkType> | undefined;
    if (menuItem.items && menuItem.items.length > 0) {
      filteredNestedItems = filterMenuItems(
        menuItem.items,
        userPermissions,
        userId
      );
    }

    let shouldInclude = false;

    if (isAllowed) {
      shouldInclude = true;

      if (
        filteredNestedItems !== undefined &&
        filteredNestedItems.length === 0
      ) {
        shouldInclude = true;
      }
    } else {
      if (filteredNestedItems !== undefined && filteredNestedItems.length > 0) {
        shouldInclude = true;
      }
    }

    if (shouldInclude) {
      const newItem = { ...menuItem };
      if (filteredNestedItems !== undefined) {
        newItem.items = filteredNestedItems;
      }
      filteredItems.push(newItem);
    }
  }

  return filteredItems;
}
