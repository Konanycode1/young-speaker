import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Young Speaker — Ta voix compte", template: "%s — Young Speaker" },
  description: "L'espace sûr où les jeunes partagent leurs idées, expériences et réalités.",
  openGraph: { title: "Young Speaker", description: "Ta voix compte. Fais-la entendre.", type: "website", locale: "fr_FR" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const account = await getCurrentUser();
  const initialUser = account ? {
    role: account.role,
    profile: account.profile ? { displayName: account.profile.displayName, username: account.profile.username } : null,
  } : null;
  return <html lang="fr" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html: `try{document.documentElement.dataset.theme=localStorage.getItem('theme')||'light'}catch(e){}`} } /></head><body><Header initialUser={initialUser}/><main>{children}</main><Footer/></body></html>;
}
