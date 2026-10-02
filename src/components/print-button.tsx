"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return <button type="button" className="button violet certificate-actions" onClick={() => window.print()}><Printer size={17} /> Imprimer / Enregistrer en PDF</button>;
}
