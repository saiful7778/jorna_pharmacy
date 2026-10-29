import { cn } from "cn";

const DEVELOPER_NAME = "Saiful Islam";
const DEVELOPER_LINKEDIN_URL =
  "https://www.linkedin.com/in/saiful-islam-0471b924b/";

type DeveloperCreditProps = {
  className?: string;
};

export function DeveloperCredit({ className }: DeveloperCreditProps) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Developed by{" "}
      <a
        href={DEVELOPER_LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
      >
        {DEVELOPER_NAME}
      </a>
    </p>
  );
}
