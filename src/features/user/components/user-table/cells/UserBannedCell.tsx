import { Info } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface UserBannedProps {
  banned: boolean;
  banReason: string | null | undefined;
  banExpires: Date | null | undefined;
}

export function UserBannedCell({
  banned,
  banExpires,
  banReason,
}: UserBannedProps) {
  if (!banned) return null;

  return (
    <HoverCard>
      <HoverCardTrigger render={<Badge variant="secondary" />}>
        <Info />
        <span>Banned</span>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        className="flex flex-col gap-0.5 text-sm text-muted-foreground"
      >
        <div>
          <span className="font-medium text-foreground">Ban Reason:</span>{" "}
          {banReason ?? "No Reason"}
        </div>
        {banExpires && (
          <div>
            <span className="font-medium text-foreground">Ban Expires:</span>
            <FormatDateCell value={banExpires} format="dd MMM yy, hh:mm a" />
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
