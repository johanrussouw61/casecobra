"use client";

import { CaseColor } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
//import { AspectRatio } from './ui/aspect-ratio'
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const PhonePreview = ({
  croppedImageUrl,
  color,
}: {
  croppedImageUrl: string;
  color: CaseColor;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [renderedDimensions, setRenderedDimensions] = useState({
    height: 0,
    width: 0,
  });

  const handleResize = () => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    setRenderedDimensions({ width, height });
  };

  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let caseBackgroundColor = "bg-zinc-950";
  if (color === "blue") caseBackgroundColor = "bg-blue-950";
  if (color === "rose") caseBackgroundColor = "bg-rose-950";

  const previewWidth = Math.max(
    1,
    Math.round(renderedDimensions.width / (3000 / 637))
  );

  const previewHeight = Math.max(
    1,
    Math.round(renderedDimensions.height / (3000 / 637))
  );

  return (
    <AspectRatio ref={ref} ratio={3000 / 2001} className="relative">
      <div
        className="absolute z-20 scale-[1.0352]"
        style={{
          left:
            renderedDimensions.width / 2 -
            renderedDimensions.width / (1216 / 121),
          top: renderedDimensions.height / 6.22,
        }}
      >
        <Image
          src={croppedImageUrl}
          alt="phone preview"
          width={previewWidth}
          height={previewHeight}
          className={cn(
            "phone-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]",
            caseBackgroundColor
          )}
        />
      </div>

      <div className="relative h-full w-full z-40">
        <Image
          src="/clearphone.png"
          alt="phone overlay"
          fill
          className="pointer-events-none object-cover antialiased rounded-md"
        />
      </div>
    </AspectRatio>
  );
};

export default PhonePreview;
