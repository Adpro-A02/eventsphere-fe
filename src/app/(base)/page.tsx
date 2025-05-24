"use client";

import { defaultQueryClientOptions } from "@/libs/tanstack-query/options";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Home() {
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);

  useEffect(() => {
    const client = new QueryClient({
      defaultOptions: defaultQueryClientOptions,
    });
    setQueryClient(client);
  }, []);

  if (!queryClient) {
    return <div>Loading...</div>;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      Halo, Dunia!
    </HydrationBoundary>
  );
}
