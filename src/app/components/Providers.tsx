"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

const client = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <KindeProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </KindeProvider>
  );
};

export default Providers;
