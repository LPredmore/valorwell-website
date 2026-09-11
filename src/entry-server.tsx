import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { AppRoutes } from "./AppRoutes";

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
  // react-helmet-async populates this object during render. Keep the provider
  // context unopinionated here, then narrow only when reading the server state.
  const helmetContext = {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>,
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
