import { useEffect, useRef } from "react";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

export function TanstackQueryProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
