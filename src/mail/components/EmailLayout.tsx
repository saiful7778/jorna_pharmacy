/** @jsxRuntime automatic */
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

import { EmailLink } from "./EmailLink";

export function EmailLayout({
  previewText,
  appName,
  children,
  supportMail,
}: {
  appName: string;
  previewText: string;
  children: React.ReactNode;
  supportMail: string;
}) {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                background: "oklch(1 0 0)",
                foreground: "oklch(0.148 0.004 228.8)",
                primary: "oklch(0.555 0.163 48.998)",
                "primary-foreground": "oklch(0.987 0.022 95.277)",
                muted: "oklch(0.963 0.002 197.1)",
                "muted-foreground": "oklch(0.56 0.021 213.5)",
                border: "oklch(0.925 0.005 214.3)",
                card: "oklch(1 0 0)",
                "card-foreground": "oklch(0.148 0.004 228.8)",
                destructive: "oklch(0.577 0.245 27.325)",
                "destructive-foreground": "oklch(0.985 0 0)",
              },
            },
          },
        }}
      >
        <Body className="mx-auto my-auto bg-background px-2 font-sans text-foreground">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-10 max-w-116.5 rounded border border-solid border-border p-5">
            <Section className="mb-6 text-center">
              <Text className="text-2xl font-bold">{appName}</Text>
            </Section>

            <Section className="text-sm text-foreground">{children}</Section>

            <Section className="mt-8 border-t border-border text-center">
              <Text className="text-center text-sm text-muted-foreground">
                Need help? Contact our support team at{" "}
                <EmailLink href={`mailto:${supportMail}`}>
                  {supportMail}
                </EmailLink>
              </Text>
              <Text className="text-mutated-foreground text-xs">
                © {new Date().getFullYear()} {appName}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mt-0 mb-2 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}

export function EmailInfoCard({ children }: { children: React.ReactNode }) {
  return (
    <Section className="my-4 rounded-md border border-border bg-card p-4">
      {children}
    </Section>
  );
}

export function EmailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Column className="w-1/2 rounded-md border border-border bg-card p-3">
      <Text className="m-0 mb-1 text-xs text-muted-foreground">{label}</Text>
      <Text className="m-0 text-base font-bold text-foreground">{value}</Text>
    </Column>
  );
}
