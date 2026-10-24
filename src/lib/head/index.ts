import { SITE_DESCRIPTION, THEME_COLOR, APP_NAME } from "@/constants";

import appCss from "../../styles.css?url";
import { env } from "../env";
import { buildHead } from "./buildHead";

export const { globalHead, head } = buildHead({
  appName: APP_NAME,
  siteUrl: env.VITE_SITE_URL,
  defaultTitle: `${APP_NAME}`,
  titleTemplate: `%s | ${APP_NAME}`,
  description: SITE_DESCRIPTION,
  themeColor: THEME_COLOR,
  robots: "noindex, nofollow",
  social: true,
  stylesheets: [appCss],
});
