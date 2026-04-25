import { Nav } from "@/components/Nav";
import { fetchSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { accounts, counts } = await fetchSettings();
  const stats: { label: string; value: number | string; tone?: "rose" }[] = [
    { label: "Active accounts", value: counts.active_accounts },
    { label: "Tweets seen", value: counts.seen },
    { label: "Candidates new", value: counts.new_candidates },
    { label: "Unscored", value: counts.unscored },
    { label: "Score ≥ 7", value: counts.high_quality, tone: "rose" },
    { label: "Posted 24h", value: counts.posted_24h, tone: "rose" },
  ];
  return (
    <>
      <Nav active="settings" />
      <main className="max-w-5xl mx-auto px-5 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Settings</h1>
          <p className="text-sm text-[color:var(--color-mute)] mt-0.5">
            Pipeline-status en geconfigureerde accounts.
          </p>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </section>

        <section className="glass-card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bold">Watched accounts</h2>
            <span className="brand-eyebrow">via @DiscoursDialoog volg-lijst</span>
          </div>
          <p className="text-xs text-[color:var(--color-mute)] mb-4">
            Volg of ontvolg op X om te wijzigen, daarna 04:00 sync of handmatig{" "}
            <code className="px-1.5 py-0.5 rounded bg-black/40">python scripts/deb_sync_following.py</code>.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
            {accounts.map((a: any) => (
              <li
                key={a.author_id}
                className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-white/5 ${
                  a.active ? "" : "opacity-30"
                }`}
              >
                <a
                  className="font-medium hover:text-[color:var(--color-rose)] truncate"
                  target="_blank"
                  rel="noopener"
                  href={`https://x.com/${a.username}`}
                >
                  @{a.username}
                </a>
                {a.display_name && (
                  <span className="text-xs text-[color:var(--color-mute)] ml-auto truncate">
                    {a.display_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-5">
          <h2 className="font-bold mb-3">Anti-spam regels</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[color:var(--color-mute)]">
            <li>• Max 3 publicaties / dag</li>
            <li>• Min 60 minuten tussen 2 posts</li>
            <li>• 1 reply per auteur / 30 dagen</li>
            <li>• 1 reply per episode-cluster / 24 uur</li>
            <li>• Skip auteurs met &lt; 50 followers</li>
            <li>• Auto-reject bij Appropriateness &lt; 6</li>
            <li>• Originality &lt; 60% similarity met last 7d posts</li>
          </ul>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "rose" }) {
  return (
    <div className="glass-card p-4">
      <div className="brand-eyebrow truncate">{label}</div>
      <div
        className={`text-2xl font-black mt-1 tabular-nums ${
          tone === "rose" ? "text-[color:var(--color-rose)]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
