export function Avatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`avatar ${size}`} style={{ background: color }}>{initials}</span>;
}
