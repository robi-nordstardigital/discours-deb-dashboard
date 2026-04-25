import Link from "next/link";

export function Nav({ active }: { active: "queue" | "data" | "history" | "settings" }) {
  const Item = ({ href, label, k }: { href: string; label: string; k: string }) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm font-medium tracking-wide transition-colors ${
        active === k
          ? "bg-[color:var(--color-rose)]/15 text-white border border-[color:var(--color-rose)]/30"
          : "text-[color:var(--color-mute)] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#14080c]/80 border-b border-[color:var(--color-line)]">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/queue" className="flex items-center gap-3 group">
          <img
            src="/logo.svg"
            alt="Discours"
            className="h-8 w-auto opacity-95 group-hover:opacity-100 transition-opacity"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-black text-[15px] tracking-tight">DEB</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-mute)] -mt-0.5">
              Discours Engine Bot
            </div>
          </div>
        </Link>
        <nav className="flex gap-1">
          <Item href="/queue" label="Queue" k="queue" />
          <Item href="/data" label="Data" k="data" />
          <Item href="/history" label="History" k="history" />
          <Item href="/settings" label="Settings" k="settings" />
        </nav>
      </div>
    </header>
  );
}
