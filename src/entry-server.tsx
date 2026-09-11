import { QueryClient } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppProviders, AppRouterContent } from "./App";

type HelmetPart = {
  toString: () => string;
};

type ServerHelmet = {
  title?: HelmetPart;
  meta?: HelmetPart;
  link?: HelmetPart;
  style?: HelmetPart;
  script?: HelmetPart;
  noscript?: HelmetPart;
  htmlAttributes?: HelmetPart;
  bodyAttributes?: HelmetPart;
};

export type ServerRenderResult = {
  html: string;
  head: string;
  htmlAttributes: string;
  bodyAttributes: string;
};

export function render(url: string): ServerRenderResult {
  const helmetContext: Record<string, unknown> = {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const html = renderToString(
    <AppProviders queryClient={queryClient} helmetContext={helmetContext}>
      <StaticRouter location={url}>
        <AppRouterContent />
      </StaticRouter>
    </AppProviders>,
  );

  const helmet = (helmetContext as { helmet?: ServerHelmet }).helmet;
  const head = [
    helmet?.title?.toString(),
    helmet?.meta?.toString(),
    helmet?.link?.toString(),
    helmet?.style?.toString(),
    helmet?.script?.toString(),
    helmet?.noscript?.toString(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    html,
    head,
    htmlAttributes: helmet?.htmlAttributes?.toString() ?? "",
    bodyAttributes: helmet?.bodyAttributes?.toString() ?? "",
  };
}
