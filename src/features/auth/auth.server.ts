import { APIError, betterAuth, type BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin, haveIBeenPwned, oneTap } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, eq } from "drizzle-orm";

import { APP_NAME, AUTH_ERROR_PAGE } from "@/constants";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import {
  AccountTable,
  RoleTable,
  SessionTable,
  UserDeviceTable,
  UserEventTable,
  UserRoleTable,
  UserSessionTable,
  UserTable,
  VerificationTable,
  type InsertUserDevice,
  type InsertUserEvent,
  type InsertUserSession,
} from "@/db/schemas";
import { RoleEnumSchema } from "@/db/schemas/enums/zod-db-enums";
import { db } from "@/lib/db.server";
import { getIp } from "@/utils/getIp";

import { env } from "../../lib/env";
import { mail } from "../../lib/mail.server";
import { systemAc, systemRoles } from "./access-control";
import { parseUserAgent } from "./device-fingerprint";

async function createUserEvent(database: DatabaseType, value: InsertUserEvent) {
  return await database.insert(UserEventTable).values(value);
}

async function upsertUserDevice(
  database: DatabaseType,
  value: InsertUserDevice
) {
  const [device] = await database
    .insert(UserDeviceTable)
    .values(value)
    .onConflictDoUpdate({
      target: [UserDeviceTable.userId, UserDeviceTable.fingerprint],
      set: {
        browser: value.browser,
        os: value.os,
        deviceType: value.deviceType,
        lastSeenAt: new Date(),
      },
    })
    .returning();

  return device;
}

function createAuth() {
  const defaultPlugins: Array<BetterAuthPlugin> = [];

  const isDev = env.ENVIRONMENT === "development";

  if (!isDev) {
    defaultPlugins.push(
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          "This password is compromised, choose a stronger one",
      })
    );
  }

  return betterAuth({
    baseURL: env.VITE_SITE_URL,
    secret: env.BETTER_AUTH_SECRET,
    appName: APP_NAME,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: UserTable,
        session: SessionTable,
        account: AccountTable,
        verification: VerificationTable,
      },
    }),
    telemetry: { enabled: true },
    trustedOrigins: [env.VITE_SITE_URL],
    advanced: {
      database: {
        generateId: false,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // 1. Find the default USER role
            const [defaultRole] = await db
              .select()
              .from(RoleTable)
              .where(eq(RoleTable.roleName, "USER"))
              .limit(1);

            if (!defaultRole) return;

            // 2. Assign it in your user_roles join table
            await db.insert(UserRoleTable).values({
              userId: user.id,
              roleId: defaultRole.id,
            });
          },
        },
        delete: {
          after: async (user) => {
            await db
              .delete(UserRoleTable)
              .where(eq(UserRoleTable.userId, user.id));
          },
        },
      },
      session: {
        delete: {
          before: async (session) => {
            try {
              const [closed] = await db
                .update(UserSessionTable)
                .set({ logoutAt: new Date(), lastSeenAt: new Date() })
                .where(eq(UserSessionTable.sessionId, session.id))
                .returning({ deviceId: UserSessionTable.deviceId });

              await createUserEvent(db, {
                userId: session.userId,
                event: "auth.logout",
                sessionId: session.id,
                deviceId: closed?.deviceId ?? null,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
              });
            } catch (error) {
              console.error(`Failed to record logout activity: ${error}`);
            }
          },
        },
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        const headers = ctx.headers ?? ctx.request?.headers;
        const newSession = ctx.context.newSession;
        const userAgent = headers?.get("user-agent") ?? null;
        const ip = headers ? getIp(headers) : null;

        // Record the login session, device and events after the endpoint has
        // committed. Runs in the background so telemetry can never break auth.
        if (newSession && userAgent) {
          ctx.context.runInBackgroundOrAwait(
            (async () => {
              const parsed = parseUserAgent(userAgent);

              const [existingDevice] = await db
                .select({ id: UserDeviceTable.id })
                .from(UserDeviceTable)
                .where(
                  and(
                    eq(UserDeviceTable.userId, newSession.user.id),
                    eq(UserDeviceTable.fingerprint, parsed.fingerprint)
                  )
                )
                .limit(1);

              const device = await upsertUserDevice(db, {
                userId: newSession.user.id,
                fingerprint: parsed.fingerprint,
                browser: parsed.browser,
                os: parsed.os,
                deviceType: parsed.deviceType,
                firstSeenAt: new Date(),
                lastSeenAt: new Date(),
              });

              const inserted = await db
                .insert(UserSessionTable)
                .values({
                  userId: newSession.user.id,
                  deviceId: device?.id ?? null,
                  sessionId: newSession.session.id,
                  loginAt: new Date(),
                  lastSeenAt: new Date(),
                  expiresAt: newSession.session.expiresAt,
                } satisfies InsertUserSession)
                .onConflictDoNothing({ target: UserSessionTable.sessionId })
                .returning({ id: UserSessionTable.id });

              if (inserted.length === 0) return;

              await createUserEvent(db, {
                userId: newSession.user.id,
                event: "auth.login",
                sessionId: newSession.session.id,
                deviceId: device?.id ?? null,
                ipAddress: ip,
                userAgent,
              });

              if (existingDevice) return;

              await createUserEvent(db, {
                userId: newSession.user.id,
                event: "device.new_detected",
                sessionId: newSession.session.id,
                deviceId: device?.id ?? null,
                ipAddress: ip,
                userAgent,
              });

              if (isDev || !ip) return;

              await mail.sendNewDeviceLoginMail({
                to: newSession.user.email,
                userName: newSession.user.name,
                loginTimestamp: Date.now().toString(),
                deviceInfo: parsed.deviceType ?? "unknown",
                browser: [parsed.browser, parsed.os].filter(Boolean).join(" "),
                ipAddress: ip,
                approximateLocation: "not available",
                secureAccountUrl: `${env.VITE_SITE_URL}/dashboard/settings/reset-password`,
              });
            })()
          );
        }

        // failed sign in
        if (ctx.path.startsWith("/sign-in") && !newSession) {
          if (userAgent && ctx.context.returned instanceof APIError) {
            const email =
              typeof ctx.body?.email === "string" ? ctx.body.email : null;

            ctx.context.runInBackgroundOrAwait(
              createUserEvent(db, {
                email,
                event: "auth.login_failed",
                ipAddress: ip,
                userAgent,
              })
            );
          }
        }

        // after password changed
        if (ctx.path.startsWith("/change-password")) {
          const session = ctx.context.session ?? ctx.context.newSession;

          if (session && headers && userAgent && ip) {
            ctx.context.runInBackgroundOrAwait(
              (async () => {
                const { deviceType } = parseUserAgent(userAgent);

                await createUserEvent(db, {
                  userId: session.user.id,
                  event: "auth.password_changed",
                  ipAddress: ip,
                  userAgent,
                });

                await mail.sendPasswordChangedMail({
                  to: session.user.email,
                  userName: session.user.name,
                  changeTimestamp: Date.now().toString(),
                  ipAddress: ip,
                  deviceInfo: deviceType ?? "unknown",
                });
              })()
            );
          }
        }

        // after user successfully sign up
        if (ctx.path.startsWith("/sign-up")) {
          const user = ctx.context.newSession?.user ?? {
            name: ctx.body.name,
            email: ctx.body.email,
          };
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (user != null) {
            ctx.context.runInBackgroundOrAwait(
              (async () => {
                await mail.sendWelcomeMail({
                  to: user.email,
                  userName: user.name,
                  dashboardUrl: `${env.VITE_SITE_URL}/dashboard`,
                });
              })()
            );
          }
        }
      }),
    },
    onAPIError: {
      errorURL: AUTH_ERROR_PAGE,
    },
    account: {
      accountLinking: {
        trustedProviders: ["google", "credential"],
      },
    },
    socialProviders: {
      google: {
        clientId: env.VITE_GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: `${env.VITE_SITE_URL}/api/auth/callback/google`,
        accessType: "offline",
        prompt: "select_account",
      },
    },
    user: {
      additionalFields: {
        timezone: {
          type: "string",
          input: true,
          required: false,
        },
        locale: {
          type: "string",
          input: true,
          required: false,
        },
        currency: {
          type: "string",
          input: true,
          required: false,
        },
      },
      changeEmail: {
        enabled: false,
      },
    },
    session: {
      freshAge: 0, // disables the freshness check
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await mail.sendEmailVerificationMail({
          to: user.email,
          userName: user.name,
          verifyUrl: url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      maxPasswordLength: 20,
      autoSignIn: false,
      requireEmailVerification: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user, url }) => {
        await createUserEvent(db, {
          userId: user.id,
          email: user.email,
          event: "auth.password_reset",
        });

        await mail.sendPasswordResetMail({
          to: user.email,
          userName: user.name,
          resetUrl: url,
        });
      },
    },
    plugins: [
      admin({
        ac: systemAc,
        roles: systemRoles,
        defaultRole: RoleEnumSchema.enum.USER,
        adminRoles: [
          RoleEnumSchema.enum.ADMIN,
          RoleEnumSchema.enum.SUPER_ADMIN,
        ],
        defaultBanExpiresIn: 60 * 60 * 24 * 10, // 10 day
        bannedUserMessage: "Your account is currently banned",
      }),
      ...defaultPlugins,
      oneTap({ clientId: env.VITE_GOOGLE_CLIENT_ID }),
      tanstackStartCookies(),
    ],
  });
}

let authInstance: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  authInstance = createAuth();

  return authInstance;
}

export type AuthType = ReturnType<typeof createAuth>;
export type AuthUser = AuthType["$Infer"]["Session"]["user"];
export type AuthSession = AuthType["$Infer"]["Session"]["session"];
