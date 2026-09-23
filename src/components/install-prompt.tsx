"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "install-prompt-dismissed-at";
const DISMISS_DAYS = 14;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "chrome" | null>(null);

  useEffect(() => {
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000) return;
    } catch {
      // stockage indisponible (navigation privée…) : on affiche quand même la bannière
    }

    const standaloneNavigator = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || standaloneNavigator.standalone === true;
    if (isStandalone) return;

    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      queueMicrotask(() => setPlatform("ios"));
      return;
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPlatform("chrome");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setPlatform(null);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {
      // rien à faire si le stockage est indisponible
    }
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setPlatform(null);
  }

  if (!platform) return null;

  return <div className="install-banner" role="dialog" aria-label="Installer Young Speaker">
    {platform === "ios"
      ? <p><Share size={16} /> Installe Young Speaker : appuie sur <b>Partager</b> puis <b>« Sur l’écran d’accueil »</b>.</p>
      : <p><Download size={16} /> Installe Young Speaker sur ton appareil pour un accès plus rapide.</p>}
    <div className="install-banner-actions">
      {platform === "chrome" && <button className="button small violet" onClick={install}>Installer</button>}
      <button className="icon-button" onClick={dismiss} aria-label="Fermer"><X size={16} /></button>
    </div>
  </div>;
}
