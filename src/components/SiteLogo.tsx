import { Link } from "@tanstack/react-router";

import { APP_NAME } from "@/constants";

export function SiteLogo() {
  return (
    <Link
      to="/"
      className="flex flex-col items-center gap-2 self-center font-semibold"
    >
      <div className="flex aspect-square size-16 items-center justify-center">
        <img src="/sitelogo.png" alt={`${APP_NAME} logo`} />
      </div>
      <span>{APP_NAME}</span>
    </Link>
  );
}
