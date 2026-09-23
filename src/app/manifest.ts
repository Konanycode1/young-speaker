import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Young Speaker — Ta voix compte",
    short_name: "Young Speaker",
    description: "L'espace sûr où les jeunes partagent leurs idées, expériences et réalités.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcf8",
    theme_color: "#1e705c",
    lang: "fr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
