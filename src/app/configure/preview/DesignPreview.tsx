"use client";

import { Configuration } from "@prisma/client";

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  return (
    <>
      <h1>DesignPreview page</h1>
      <p>{configuration.croppedImageUrl}</p>
    </>
  );
};

export default DesignPreview;
