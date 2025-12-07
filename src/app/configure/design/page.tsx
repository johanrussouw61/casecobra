import { db } from "@/app/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = await searchParams;

  if (!id || typeof id !== "string") {
    return notFound();
  }
  //console.log("inside degisn/page id: ", id);
  const whereId = id;

  let configuration;
  try {
    configuration = await db.configuration.findFirstOrThrow({
      where: { id: whereId },
    });
    //console.log("inside degisn/page configuration: ", configuration);
  } catch (err) {
    // Log full error server-side for diagnostics
    console.error("db error fetching configuration:", err);
    // Render a friendly error message instead of throwing a 500
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Database error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load the configuration right now. Please try again
          later.
        </p>
      </div>
    );
  }

  const { imageUrl, width, height } = configuration;
  console.log("Configuration details:", { imageUrl, width, height });

  return (
    <DesignConfigurator
      configId={configuration.id}
      imageUrl={imageUrl}
      imageDimensions={{
        width,
        height,
      }}
    />
  );
};

export default Page;
