import { Font } from "@react-pdf/renderer";

let registered = false;

/** Podrška za bosanske znakove (č, ć, š, ž, đ). */
export function ensurePdfFonts(): void {
  if (registered) return;
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-ext-400-normal.woff",
        fontWeight: 400,
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-ext-700-normal.woff",
        fontWeight: 700,
      },
    ],
  });
  registered = true;
}
