import "dotenv/config";
import sharp from "sharp";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import { db } from "@/app/db/index";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      //console.log("file url", file.ufsUrl);
      const { configId } = metadata.input;
      const res = await fetch(file.ufsUrl);
      const buffer = await res.arrayBuffer();
      const imgMetadata = sharp(buffer).metadata();
      const { width, height } = await imgMetadata;

      console.log("Image dimensions:", width, height);
      //console.log("configId:", configId);
      //console.log("process.env.DATABASE_URL,", process.env.DATABASE_URL);
      if (!configId) {
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.ufsUrl,
            width: width || 500,
            height: height || 500,
          },
        });
        //console.log("configuration:", configuration);
        return { configId: configuration.id };
      } else {
        const updatedConfiguration = await db.configuration.update({
          where: { id: configId },
          data: {
            croppedImageUrl: file.ufsUrl,
          },
        });
        return { configId: updatedConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
