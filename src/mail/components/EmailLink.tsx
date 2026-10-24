/** @jsxRuntime automatic */
import { Link } from "react-email";

export function EmailLink({
  href,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className="text-sm break-all text-primary" {...props}>
      {children}
    </Link>
  );
}
