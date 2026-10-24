import { cn } from "cn";

import { formatEnumValue } from "@/utils/formatEnum";
import { resolveUserImage } from "@/utils/resolveUserImage";
import { strInitials } from "@/utils/strInitials";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
  containerClassName?: string;
  className?: string;
  imageUrl?: string | null | undefined;
  userName: string;
  userEmail: string;
  userRoles?: Array<{
    id: string;
    roleName: string;
  }>;
  showRoleDetails?: boolean;
  showDetails?: boolean;
  isActive?: boolean;
}

export function UserAvatar({
  containerClassName,
  className,
  imageUrl,
  userName,
  userEmail,
  userRoles,
  showRoleDetails = false,
  showDetails = false,
  isActive = false,
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 text-left",
        containerClassName
      )}
    >
      <div className="relative">
        <Avatar className={cn("size-8", className)}>
          <AvatarImage src={resolveUserImage(imageUrl)} alt={userName} />
          <AvatarFallback className="text-xs font-semibold uppercase">
            {strInitials(userName)}
          </AvatarFallback>
        </Avatar>
        {isActive && (
          <span className="absolute -inset-e-0.5 -bottom-0.5 size-3 rounded-full border-2 border-background bg-emerald-500">
            <span className="sr-only">Online</span>
          </span>
        )}
      </div>
      {showDetails && (
        <div className="grid flex-1 text-left leading-tight">
          <div className="text-sm font-medium">{userName}</div>
          <div className="truncate text-xs text-muted-foreground">
            {showRoleDetails
              ? userRoles && userRoles.length > 0
                ? userRoles
                    .map((role) => formatEnumValue(role.roleName))
                    .join(", ")
                : userEmail
              : userEmail}
          </div>
        </div>
      )}
    </div>
  );
}
