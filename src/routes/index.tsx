import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill, ShoppingCart, Wallet } from "lucide-react";

import { DeveloperCredit } from "@/components/shared/DeveloperCredit";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME, DEFAULT_UNAUTH_PATH } from "@/constants";

export const Route = createFileRoute("/")({ component: App });

const features = [
  {
    icon: Pill,
    title: "Medicine inventory",
    description:
      "Keep track of every medicine, its stock levels, and where it is going.",
  },
  {
    icon: ShoppingCart,
    title: "Purchases and sales",
    description:
      "Record purchases from companies and sales to customers in one place.",
  },
  {
    icon: Wallet,
    title: "Finance and reports",
    description:
      "See payments, balances, and daily sales without digging through spreadsheets.",
  },
];

function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link className="inline-flex items-center gap-1" to="/">
            <span className="flex aspect-square size-8 items-center justify-center">
              <img src="/sitelogo.png" alt={`${APP_NAME} logo`} />
            </span>
            <span className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{APP_NAME}</span>
              <span className="truncate text-xs text-muted-foreground">
                Platfrom
              </span>
            </span>
          </Link>
          <Link
            to={DEFAULT_UNAUTH_PATH}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Run your pharmacy with confidence
          </h1>
          <p className="text-lg text-muted-foreground">
            {APP_NAME} brings medicines, purchases, sales, customers, and
            finance into one secure web app.
          </p>
          <Link
            to={DEFAULT_UNAUTH_PATH}
            className={buttonVariants({ size: "lg" })}
          >
            Get started
          </Link>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-lg border p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {APP_NAME}. All rights reserved.</span>
          <DeveloperCredit />
        </div>
      </footer>
    </div>
  );
}
