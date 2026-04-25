import Link from "next/link";

export function Nav({ active }: { active: "queue" | "history" | "settings" }) {
  const Item = ({ href, label, k }: { href: string; label: string; k: string }) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
        active === k ? "bg-white/10 text-white" : "text-[color:var(--color-mute)] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-[color:var(--color-line)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "var(--color-bordeaux)" }}
          />
          <span className="font-semibold tracking-tight">DEB</span>
          <span className="text-[color:var(--color-mute)] text-xs hidden sm:inline">
            @DiscoursDialoog reply queue
          </span>
        </div>
        <nav className="flex gap-1">
          <Item href="/queue" label="Queue" k="queue" />
          <Item href="/history" label="History" k="history" />
          <Item href="/settings" label="Settings" k="settings" />
        </nav>
      </div>
    </header>
  );
}
