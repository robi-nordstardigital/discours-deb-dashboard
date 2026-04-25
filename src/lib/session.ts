import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type Session = { user?: string };

const opts: SessionOptions = {
  password: process.env.DEB_SESSION_SECRET || "deb-dashboard-fallback-please-set-DEB_SESSION_SECRET-min32",
  cookieName: "deb_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession(): Promise<Session & { save: () => Promise<void>; destroy: () => Promise<void> }> {
  const store = await cookies();
  return getIronSession<Session>(store, opts);
}

export async function requireUser(): Promise<string> {
  const s = await getSession();
  if (!s.user) throw new Error("Unauthorized");
  return s.user;
}
