/** @jsxRuntime automatic */
import { render, toPlainText } from "react-email";
import { WorkerMailer, type EmailOptions } from "worker-mailer";

import AccountLockedMail, {
  type AccountLockedMailProps,
} from "./templates/auth/AccountLockedMail";
import EmailVerificationMail, {
  type EmailVerificationMailProps,
} from "./templates/auth/EmailVerificationMail";
import NewDeviceLoginMail, {
  type NewDeviceLoginMailProps,
} from "./templates/auth/NewDeviceLoginMail";
import PasswordChangedMail, {
  type PasswordChangedMailProps,
} from "./templates/auth/PasswordChangedMail";
import ResetPasswordMail, {
  type ResetPasswordMailProps,
} from "./templates/auth/ResetPasswordMail";
import RoleChangedMail, {
  type RoleChangedMailProps,
} from "./templates/auth/RoleChangedMail";
import SuspiciousLoginMail, {
  type SuspiciousLoginMailProps,
} from "./templates/auth/SuspiciousLoginMail";
import WelcomeMail, {
  type WelcomeMailProps,
} from "./templates/auth/WelcomeMail";

type SendMailOption = Omit<EmailOptions, "from">;

type WelcomeEmailOptions = Omit<SendMailOption, "subject" | "text" | "html"> &
  Omit<WelcomeMailProps, "appName" | "supportMail">;

type EmailVerificationMailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<EmailVerificationMailProps, "appName" | "supportMail">;

type PasswordResetEmailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<ResetPasswordMailProps, "appName" | "supportMail">;

type PasswordChangedMailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<PasswordChangedMailProps, "appName" | "supportMail">;

type NewDeviceLoginEmailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<NewDeviceLoginMailProps, "appName" | "supportMail">;

type SuspiciousLoginMailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<SuspiciousLoginMailProps, "appName" | "supportMail">;

type RoleChangedMailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<RoleChangedMailProps, "appName" | "supportMail">;

type AccountLockedMailOptions = Omit<
  SendMailOption,
  "subject" | "text" | "html"
> &
  Omit<AccountLockedMailProps, "appName" | "supportMail">;

export interface IMailService {
  sendWelcomeMail: (options: WelcomeEmailOptions) => Promise<string>;

  sendEmailVerificationMail: (
    options: EmailVerificationMailOptions
  ) => Promise<string>;

  sendPasswordResetMail: (
    options: PasswordResetEmailOptions
  ) => Promise<string>;

  sendPasswordChangedMail: (
    options: PasswordChangedMailOptions
  ) => Promise<string>;

  sendNewDeviceLoginMail: (
    options: NewDeviceLoginEmailOptions
  ) => Promise<string>;

  sendSuspiciousLoginMail: (
    options: SuspiciousLoginMailOptions
  ) => Promise<string>;

  sendRoleChangedMail: (options: RoleChangedMailOptions) => Promise<string>;

  sendAccountLockedMail: (options: AccountLockedMailOptions) => Promise<string>;
}

export interface MailConfig {
  authUser: string;
  authPass: string;
  appName: string;
  mailFrom: string;
}

export class MailService {
  public readonly mailConfig: MailConfig;

  constructor(config: MailConfig) {
    this.mailConfig = config;
  }

  private async sendMail(options: SendMailOption): Promise<string> {
    const domain = this.mailConfig.mailFrom.split("@").pop();
    const messageId = `<${crypto.randomUUID()}@${domain}>`;

    await WorkerMailer.send(
      {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        startTls: true,
        authType: ["plain", "login"],
        credentials: {
          username: this.mailConfig.authUser,
          password: this.mailConfig.authPass,
        },
      },
      {
        ...options,
        from: {
          name: this.mailConfig.appName,
          email: this.mailConfig.mailFrom,
        },
        headers: { "Message-ID": messageId },
      }
    );

    return messageId;
  }

  public async sendMailTemplate(
    to: SendMailOption["to"],
    subject: string,
    component: React.ReactNode,
    options: Partial<SendMailOption> = {}
  ): Promise<string> {
    const html = await render(component);
    const text = toPlainText(html);

    return this.sendMail({
      ...options,
      to,
      subject,
      text,
      html,
    });
  }

  public async sendWelcomeMail({
    to,
    ...options
  }: WelcomeEmailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Welcome to ${this.mailConfig.appName}`,
      <WelcomeMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendEmailVerificationMail({
    to,
    ...options
  }: EmailVerificationMailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Verify your email for ${this.mailConfig.appName}`,
      <EmailVerificationMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendPasswordResetMail({
    to,
    ...options
  }: PasswordResetEmailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Reset your password for ${this.mailConfig.appName}`,
      <ResetPasswordMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendPasswordChangedMail({
    to,
    ...options
  }: PasswordChangedMailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Password changed for ${this.mailConfig.appName}`,
      <PasswordChangedMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendNewDeviceLoginMail({
    to,
    ...options
  }: NewDeviceLoginEmailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `New device login detected for ${this.mailConfig.appName}`,
      <NewDeviceLoginMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendSuspiciousLoginMail({
    to,
    ...options
  }: SuspiciousLoginMailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Suspicious login detected for your ${this.mailConfig.appName} account`,
      <SuspiciousLoginMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendRoleChangedMail({
    to,
    ...options
  }: RoleChangedMailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Your role has been changed for ${this.mailConfig.appName}`,
      <RoleChangedMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendAccountLockedMail({
    to,
    ...options
  }: AccountLockedMailOptions): Promise<string> {
    return this.sendMailTemplate(
      to,
      `Your ${this.mailConfig.appName} account has been locked`,
      <AccountLockedMail
        supportMail={this.mailConfig.mailFrom}
        appName={this.mailConfig.appName}
        {...options}
      />,
      options
    );
  }
}
