import {
  Link,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { LogOut, UserRound, UserRoundCog } from "lucide-react";
import toast from "react-hot-toast";

import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_UNAUTH_PATH } from "@/constants";
import { authClient } from "@/features/auth/auth.client";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

export function TopbarUser() {
  const navigate = useNavigate();
  const router = useRouter();
  const { pathname } = useLocation();

  const user = useAuthStore((state) => state.user);

  const handleLogout = createClientOnlyFn(async () => {
    const toastId = "sign_out_toast_message";

    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          toast.loading("Logging out...", { id: toastId });
        },
        onSuccess: () => {
          toast.success("Logged out successfully", {
            id: toastId,
          });
          router.invalidate();
          navigate({
            href: `${DEFAULT_UNAUTH_PATH}?redirect=${pathname}`,
          });
        },
        onError: () => {
          toast.error("Failed to log out. Please try again", {
            id: toastId,
          });
        },
      },
    });
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="size-8">
        <UserAvatar
          userEmail={user.email}
          imageUrl={user.image}
          userName={user.name}
          isActive
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <UserAvatar
              userEmail={user.email}
              imageUrl={user.image}
              userName={user.name}
              showDetails
              isActive
            />
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/dashboard/profile" />}>
            <UserRound />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/dashboard/settings/profile" />}>
            <UserRoundCog />
            <span>Profile setting</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
