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
      <form action={login} className="glass-card p-8 w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">DEB</h1>
          <p className="text-sm text-[color:var(--color-mute)]">Discours Engine Bot, approval queue</p>
        </div>
        <input
          name="password"
          type="password"
          placeholder="Wachtwoord"
          autoFocus
          className="w-full bg-black/30 border border-[color:var(--color-line)] rounded-lg px-3 py-2 outline-none focus:border-white/40"
        />
        {sp.error && <p className="text-sm text-red-400">Verkeerd wachtwoord.</p>}
        <button className="w-full btn-publish text-white font-medium rounded-lg py-2">
          Inloggen
        </button>
      </form>
    </main>
  );
}
