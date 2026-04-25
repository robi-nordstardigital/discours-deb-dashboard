import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const expected = process.env.DEB_DASHBOARD_PASSWORD;
  if (!expected) throw new Error("DEB_DASHBOARD_PASSWORD not configured");
  if (password !== expected) {
    redirect("/login?error=1");
  }
  const s = await getSession();
  s.user = "robi";
  await s.save();
  redirect("/queue");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <form action={login} className="glass-card p-8 w-full max-w-sm space-y-5">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Discours" className="h-12 w-auto" />
          <div>
            <h1 className="text-xl font-black tracking-tight">DEB</h1>
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-rose)] font-bold">
              Discours Engine Bot
            </p>
            <p className="serif-italic text-xs text-[color:var(--color-mute)] mt-1">
              Degelijkheid &amp; dialoog
            </p>
          </div>
        </div>
        <input
          name="password"
          type="password"
          placeholder="Wachtwoord"
          autoFocus
          className="w-full bg-black/30 border border-[color:var(--color-line)] rounded-lg px-3 py-2 text-sm focus:border-[color:var(--color-rose)]/40 transition-colors"
        />
        {sp.error && <p className="text-sm text-red-400">Verkeerd wachtwoord.</p>}
        <button className="w-full btn-publish text-white font-bold rounded-lg py-2.5">
          Inloggen
        </button>
      </form>
    </main>
  );
}
