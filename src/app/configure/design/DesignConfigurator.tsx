"use client";
import HandleComponent from "@/app/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import NextImage from "next/image";
import { Rnd } from "react-rnd";
import { RadioGroup } from "@headlessui/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  COLORS,
  FINISHES,
  MATERIALS,
  MODELS,
} from "@/validators/option-validator";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  ChevronDownIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { BASE_PRICE } from "@/config/products";
import { useUploadThing } from "@/lib/uploadthing";
import { useMutation } from "@tanstack/react-query";
import { SafeConfigArgs, saveConfig as _saveConfig } from "./actions";
import { useRouter } from "next/navigation";

interface DesignConfiguratorProps {
  configId: string;
  imageUrl: string;
  imageDimensions: { width: number; height: number };
}

const DesignConfigurator = ({
  configId,
  imageUrl,
  imageDimensions,
}: DesignConfiguratorProps) => {
  const router = useRouter();
  const { mutate: saveConfig } = useMutation({
    mutationKey: ["save-config"],
    mutationFn: async (args: SafeConfigArgs) => {
      await Promise.all([saveConfiguration(), _saveConfig(args)]);
    },
    onError: () => {
      toast("Something went wrong", {
        description: "There was an error on our end. Please try again.",
      });
    },
    onSuccess: () => {
      router.push(`/configure/preview?id=${configId}`);
    },
  });

  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODELS.options)[number];
    material: (typeof MATERIALS.options)[number];
    finish: (typeof FINISHES.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0],
  });
  const TW_BG_MAP: Record<string, string> = {
    "zinc-900": "bg-zinc-900",
    "blue-950": "bg-blue-950",
    "rose-950": "bg-rose-950",
  };
  const TW_BORDER_MAP: Record<string, string> = {
    "zinc-900": "border-zinc-900",
    "blue-950": "border-blue-950",
    "rose-950": "border-rose-950",
  };

  const [renderedDimension, setRenderedDimension] = useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
  });

  const [renderedPosition, setRenderedPositsion] = useState({
    x: 150,
    y: 205,
  });

  const phoneCaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startUpload } = useUploadThing("imageUploader");

  async function saveConfiguration() {
    try {
      if (!phoneCaseRef.current || !containerRef.current) {
        throw new Error("missing refs");
      }

      const {
        left: caseLeft,
        top: caseTop,
        width: caseWidth,
        height: caseHeight,
      } = phoneCaseRef.current.getBoundingClientRect();

      const { left: containerLeft, top: containerTop } =
        containerRef.current.getBoundingClientRect();

      const leftOffset = caseLeft - containerLeft;
      const topOffset = caseTop - containerTop;

      const actualX = renderedPosition.x - leftOffset;
      const actualY = renderedPosition.y - topOffset;

      // device pixel ratio aware canvas
      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(caseWidth * dpr);
      canvas.height = Math.round(caseHeight * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("could not get canvas context");
      // keep coordinates in CSS pixels by scaling
      ctx.scale(dpr, dpr);

      const userImage = new Image();
      userImage.crossOrigin = "anonymous";
      userImage.src = imageUrl;
      await new Promise((resolve) => (userImage.onload = resolve));

      // find actual rendered img element (NextImage creates an <img>)
      const imgEl = containerRef.current.querySelector(
        'img[alt="your image"]'
      ) as HTMLImageElement | null;

      let dx = Math.round(actualX);
      let dy = Math.round(actualY);
      let dw = Math.round(renderedDimension.width);
      let dh = Math.round(renderedDimension.height);
      let imgNaturalW = userImage.naturalWidth || dw;
      let imgNaturalH = userImage.naturalHeight || dh;

      if (imgEl) {
        const imgRect = imgEl.getBoundingClientRect();
        dx = Math.round(imgRect.left - caseLeft);
        dy = Math.round(imgRect.top - caseTop);
        dw = Math.round(imgRect.width);
        dh = Math.round(imgRect.height);
        imgNaturalW = imgEl.naturalWidth || dw;
        imgNaturalH = imgEl.naturalHeight || dh;
      }

      // compute visible portion of the displayed image relative to the phone-case canvas
      const srcDisplayX = Math.max(0, -dx);
      const srcDisplayY = Math.max(0, -dy);
      const srcDisplayW = Math.max(
        0,
        Math.min(dw - srcDisplayX, caseWidth - Math.max(0, dx))
      );
      const srcDisplayH = Math.max(
        0,
        Math.min(dh - srcDisplayY, caseHeight - Math.max(0, dy))
      );

      // debug log to browser console for diagnosis
      // eslint-disable-next-line no-console
      console.debug("saveConfiguration debug", {
        caseLeft,
        caseTop,
        caseWidth,
        caseHeight,
        renderedPosition,
        renderedDimension,
        dx,
        dy,
        dw,
        dh,
        imgNaturalW,
        imgNaturalH,
        srcDisplayX,
        srcDisplayY,
        srcDisplayW,
        srcDisplayH,
      });

      // clear canvas first
      ctx.clearRect(0, 0, caseWidth, caseHeight);

      if (srcDisplayW > 0 && srcDisplayH > 0) {
        const scaleX = imgNaturalW / dw;
        const scaleY = imgNaturalH / dh;

        const sx = srcDisplayX * scaleX;
        const sy = srcDisplayY * scaleY;
        const sWidth = srcDisplayW * scaleX;
        const sHeight = srcDisplayH * scaleY;

        const destX = Math.max(0, dx);
        const destY = Math.max(0, dy);
        const destW = srcDisplayW;
        const destH = srcDisplayH;

        ctx.drawImage(
          userImage,
          sx,
          sy,
          sWidth,
          sHeight,
          destX,
          destY,
          destW,
          destH
        );
      }

      const base64 = canvas.toDataURL();
      const base64Data = base64.split(",")[1];

      const blob = base64ToBlob(base64Data, "image/png");
      const file = new File([blob], "filename.png", { type: "image/png" });
      await startUpload([file], { configId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("saveConfiguration error", err);
      toast("Something went wrong", {
        description: "There was an error on our end. Please try again.",
      });
    }
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharaters = atob(base64);
    const byteNumbers = new Array(byteCharaters.length);
    for (let i = 0; i < byteCharaters.length; i++) {
      byteNumbers[i] = byteCharaters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20 pb-20">
      {/* Left column: phone preview (spans 2 cols on lg) */}
      <div
        ref={containerRef}
        className="relative h-150 overflow-hidden col-span-full lg:col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {/* allow pointer events on the container so the draggable area can receive events */}
        <div className="relative w-60 bg-opacity-50 aspect-896/1831">
          <AspectRatio
            ref={phoneCaseRef}
            ratio={896 / 1831}
            className="relative z-50 aspect-896/1831 w-full"
          >
            <NextImage
              alt=""
              src="/phone-template.png"
              width={896}
              height={1831}
              className="pointer-events-none z-50 select-none"
            />
          </AspectRatio>
          <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-4xl shadow-[0_0_0_99999px_rgba(229,231,235,0.6)] pointer-events-none" />
          <div
            className={cn(
              "absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-4xl pointer-events-none",
              TW_BG_MAP[options.color.tw]
            )}
          />

          <Rnd
            default={{
              x: 150,
              y: 205,
              height: imageDimensions.height / 4,
              width: imageDimensions.width / 4,
            }}
            className="absolute z-60 border-[3px] border-primary pointer-events-auto"
            lockAspectRatio
            resizeHandleComponent={{
              bottomRight: <HandleComponent />,
              bottomLeft: <HandleComponent />,
              topRight: <HandleComponent />,
              topLeft: <HandleComponent />,
            }}
            onResizeStop={(_, __, ref, ___, { x, y }) => {
              setRenderedDimension({
                height: parseInt(ref.style.height.slice(0, -2)),
                width: parseInt(ref.style.width.slice(0, -2)),
              });
              setRenderedPositsion({ x, y });
            }}
            onDragStop={(_, data) => {
              const { x, y } = data;
              setRenderedPositsion({ x, y });
            }}
          >
            <div className="relative w-full h-full">
              <NextImage
                src={imageUrl}
                alt="your image"
                className="pointer-events-auto"
                fill
              />
            </div>
          </Rnd>
        </div>
      </div>

      {/* Right column: Scroll area */}
      <div className="h-150 w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ScrollArea className="relative flex-1 overflow-auto">
          <div
            aria-hidden="true"
            className="absolute z-10 inset-x-0 bottom-0 h-12 bg-linear-to-t  from-white pointer-events-none"
          />
          <div className="px-8 pb-12 pt-8">
            <h2 className="tracking-tight font-bold text-3xl text-black">
              Customize your case
            </h2>
            {/* put other controls here (text, sliders, color pickers) */}
            <div className="w-full h-px bg-zinc-200 my-6" />
            <div className="relative mt-4 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <RadioGroup
                  value={options.color}
                  onChange={(val) => {
                    setOptions((prev) => ({
                      ...prev,
                      color: val,
                    }));
                  }}
                >
                  <Label>Color: {options.color.label}</Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {COLORS.map((color) => (
                      <RadioGroup.Option
                        key={color.label}
                        value={color}
                        className={({ active, checked }) =>
                          cn(
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2",
                            active || checked
                              ? TW_BORDER_MAP[color.tw]
                              : "border-transparent"
                          )
                        }
                      >
                        <span
                          className={cn(
                            TW_BG_MAP[color.tw],
                            "h-8 w-8 rounded-full border border-black border-opacity-10"
                          )}
                        />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
                <div className="relative flex flex-col gap-3 w-full">
                  <Label>Model</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full  justify-between"
                      >
                        {options.model.label}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {MODELS.options.map((model) => (
                        <DropdownMenuItem
                          key={model.label}
                          className={cn(
                            "flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100",
                            {
                              "bg-zinc-100":
                                model.label === options.model.label,
                            }
                          )}
                          onClick={() => {
                            setOptions((prev) => ({ ...prev, model }));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              model.label === options.model.label
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {[MATERIALS, FINISHES].map(
                  ({ name, options: selectableOptions }) => (
                    <div key={name} className="relative">
                      <Label>
                        {name.slice(0, 1).toUpperCase() + name.slice(1)}
                      </Label>
                      <div className="mt-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              {options[name].label}
                              <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {selectableOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2 text-sm hover:bg-zinc-100",
                                  {
                                    "bg-zinc-100":
                                      option.value === options[name].value,
                                  }
                                )}
                                onClick={() =>
                                  setOptions((prev) => ({
                                    ...prev,
                                    [name]: option,
                                  }))
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      option.value === options[name].value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span>{option.label}</span>
                                </div>
                                <span className="text-gray-700">
                                  {formatPrice(option.price / 100)}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="w-full px-8 h-16 bg-white">
          <div className="h-px w-full bg-zinc-200" />
          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <p className="font-medium whitespace-nowrap-">
                {formatPrice(
                  (BASE_PRICE + options.finish.price + options.material.price) /
                    100
                )}
              </p>
              <div className="bg-green-500 w-full flex flex-col items-center justify-center">
                <Button
                  onClick={() =>
                    saveConfig({
                      configId,
                      color: options.color.value,
                      finish: options.finish.value,
                      material: options.material.value,
                      model: options.model.value,
                    })
                  }
                  className="w-full"
                  size="sm"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1.5 inline" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignConfigurator;
