"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function BecomeSpeakerButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function become() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/account/become-speaker", { method: "POST" });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "Impossible de passer en Young Speaker pour le moment."); setLoading(false); return; }
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/dashboard");
    router.refresh();
  }

  return <div>
    <button className="button violet" onClick={become} disabled={loading}>{loading ? "Un instant…" : "Devenir Speaker"} {!loading && <ArrowRight size={17} />}</button>
    {error && <p className="form-error" style={{ marginTop: ".5rem" }}>{error}</p>}
  </div>;
}
