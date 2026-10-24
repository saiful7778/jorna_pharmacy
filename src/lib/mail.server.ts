import { APP_NAME } from "@/constants";
import { createMailService } from "@/mail/createMailService.factory";

import { env } from "./env";

export const mail = createMailService({
  appName: APP_NAME,
  authPass: env.MAIL_PASS,
  authUser: env.MAIL_USER,
  mailFrom: env.VITE_MAIL,
});
