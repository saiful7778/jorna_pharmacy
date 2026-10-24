import { buildFaviconLinks } from "./favicon";
import { buildOgMeta } from "./og";

export interface BuildHeadConfig {
  appName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  themeColor: string;
  robots?: string;
  stylesheets?: ReadonlyArray<string>;
  ogImagePath?: string;
  social?: boolean;
}

export type HeadPageOptions = {
  pathname: string;
  description?: string;
} & (
  | { title: string; titleByTemplate?: never }
  | { titleByTemplate: string; title?: never }
);

export interface HeadResult {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
}

const GOOGLEBOT_DEFAULT =
  "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1";

export function buildHead(config: BuildHeadConfig) {
  const {
    appName,
    siteUrl,
    defaultTitle,
    titleTemplate,
    description,
    themeColor,
    robots = "index, follow",
    stylesheets = [],
    ogImagePath = "/opengraph-image.jpeg",
    social = true,
  } = config;

  if (!titleTemplate.includes("%s")) {
    throw new Error('buildHead: titleTemplate must contain "%s"');
  }

  const baseUrl = siteUrl.replace(/\/$/, "");
  const ogImage = `${baseUrl}${ogImagePath}`;
  const googlebot = robots.includes("noindex") ? robots : GOOGLEBOT_DEFAULT;

  const canonicalUrl = (pathname: string) =>
    pathname === "/" ? baseUrl : `${baseUrl}${pathname}`;

  const buildMeta = (
    title: string,
    pageDescription: string,
    url: string | undefined
  ): Array<Record<string, string>> => {
    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: themeColor },
      { title },
      { name: "description", content: pageDescription },
      { name: "robots", content: robots },
      { name: "googlebot", content: googlebot },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: appName },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
    ];

    if (social) {
      meta.push(
        ...buildOgMeta({
          appName,
          title,
          description: pageDescription,
          url: url ?? baseUrl,
          imageUrl: ogImage,
        })
      );
    }

    return meta;
  };

  const buildLinks = (
    url: string | undefined
  ): Array<Record<string, string>> => [
    ...stylesheets.map((href) => ({ rel: "stylesheet", href })),
    ...buildFaviconLinks(),
    ...(url ? [{ rel: "canonical", href: url }] : []),
  ];

  const globalHead = (): HeadResult => ({
    meta: buildMeta(defaultTitle, description, undefined),
    links: buildLinks(undefined),
  });

  const head = (options: HeadPageOptions): HeadResult => {
    const title =
      options.titleByTemplate === undefined
        ? options.title
        : titleTemplate.replace("%s", () => options.titleByTemplate);
    const pageDescription = options.description ?? description;
    const url = canonicalUrl(options.pathname);

    return {
      meta: buildMeta(title, pageDescription, url),
      links: buildLinks(url),
    };
  };

  return { globalHead, head };
}
