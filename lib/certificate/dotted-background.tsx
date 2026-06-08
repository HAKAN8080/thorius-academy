import path from "node:path";
import React from "react";
import { Image } from "@react-pdf/renderer";

const DOT_BACKGROUND_PATH = path.join(
  process.cwd(),
  "lib/certificate/dot-background.png",
);

interface DottedBackgroundProps {
  width: number;
  height: number;
}

export function DottedBackground({ width, height }: DottedBackgroundProps) {
  return (
    <Image
      src={DOT_BACKGROUND_PATH}
      style={{
        width,
        height,
      }}
    />
  );
}
