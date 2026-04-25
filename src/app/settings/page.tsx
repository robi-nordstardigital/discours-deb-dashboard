import { Nav } from "@/components/Nav";
import { fetchSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { accounts, counts } = await fetchSettings();
  return (
    <>
      <Nav active="settings" />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-lg font-semibold">Settings</h1>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Active accounts" value={counts.active_accounts} />
          <Stat label="Seen tweets" value={counts.seen} />
          <Stat label="New candidates" value={counts.new_candidates} />
          <Stat label="Unscored responses" value={counts.unscored} />
          <Stat label="Score ≥ 7" value={counts.high_quality} />
          <Stat label="Posted 24h" value={counts.posted_24h} />
        </section>

        <section className="glass-card p-4">
          <h2 className="font-medium mb-2">Watched accounts</h2>
          <p className="text-xs text-[color:var(--color-mute)] mb-3">
            Gesynchroniseerd vanuit @DiscoursDialoog volg-lijst. Volg of ontvolg op X om te
            wijzigen, daarna 04:00 sync of handmatig{" "}
            <code>python scripts/deb_sync_following.py</code>.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
            {accounts.map((a: any) => (
              <li
                key={a.author_id}
                className={`flex items-center justify-between px-2 py-1 rounded ${
                  a.active ? "" : "opacity-40"
                }`}
              >
                <a
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener"
                  href={`https://x.com/${a.username}`}
                >
                  @{a.username}
                </a>
                {a.display_name && (
                  <span className="text-xs text-[color:var(--color-mute)] ml-2 truncate">
                    {a.display_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card p-4">
      <div className="text-xs uppercase tracking-wider text-[color:var(--color-mute)]">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
