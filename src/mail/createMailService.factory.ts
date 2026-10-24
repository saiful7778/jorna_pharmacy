import {
  MailService,
  type IMailService,
  type MailConfig,
} from "./Mail.service";

export function createMailService(config: MailConfig): IMailService {
  return new MailService(config);
}
