"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const sessionPersister = createAsyncStoragePersister({
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  });
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: sessionPersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
