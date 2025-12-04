"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAuthStatus } from "./actions";
import { useRouter } from "next/navigation";

const Page = () => {
  const [configId, setConfigId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const configurationId = localStorage.getItem("configurationId");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (configurationId) setConfigId(configurationId);
  }, []);

  const { data } = useQuery({
    queryKey: ["auth-callback"],
    queryFn: async () => await getAuthStatus(),
    retry: true,
    retryDelay: 1000,
  });

  if (data?.success) {
    localStorage.removeItem("configuratinId");
    router.push(`/configure/preview?id=${configId}`);
  } else {
    router.push("/");
  }
};

export default Page;
