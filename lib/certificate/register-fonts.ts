import path from "node:path";
import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

export function registerCertificateFonts(): void {
  if (fontsRegistered) {
    return;
  }

  const fontsDir = path.join(process.cwd(), "lib/certificate/fonts");

  Font.register({
    family: "NotoSans",
    fonts: [
      {
        src: path.join(fontsDir, "NotoSans-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(fontsDir, "NotoSans-Bold.ttf"),
        fontWeight: 700,
      },
      {
        src: path.join(fontsDir, "NotoSans-Italic.ttf"),
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  });

  Font.register({
    family: "GreatVibes",
    src: path.join(fontsDir, "GreatVibes-Regular.ttf"),
  });

  fontsRegistered = true;
}
