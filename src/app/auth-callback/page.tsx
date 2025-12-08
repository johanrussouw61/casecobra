"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAuthStatus } from "./actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const Page = () => {
  const getConfigId = () => {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("configurationId")
        : null;
    } catch {
      return null;
    }
  };

  const configurationId = getConfigId();

  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["auth-callback"],
    queryFn: async () => await getAuthStatus(),
    retry: true,
    retryDelay: 1000,
  });

  //console.log("data from getAuthStatus: ", data);

  useEffect(() => {
    if (data?.success === true && configurationId) {
      localStorage.removeItem("configurationId");
      router.push(`/configure/preview?id=${configurationId}`);
    } else if (data?.success === false) {
      router.push("/");
    }
  }, [data, configurationId, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <h3 className="font-semibold text-xl">Logging you in...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
