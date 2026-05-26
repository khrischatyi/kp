import * as React from "react";
import { api, ApiError } from "@/lib/api";
import type { AdminContact, AboutContent } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Login Form ─────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.adminLogin(username, password);
      onLogin(res.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-lg border border-border/60 bg-surface/40 p-8"
      >
        <h1 className="font-display text-2xl">Admin Login</h1>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
type Tab = "contacts" | "careers" | "about";

const TAB_LABELS: Record<Tab, string> = {
  contacts: "Contact Submissions",
  careers: "Career Applications",
  about: "About Page",
};

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = React.useState<Tab>("contacts");

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60 bg-surface/40">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-display text-xl">SCI Admin</h1>
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mt-6">
        <div className="flex gap-1 border-b border-border/60">
          {(["contacts", "careers", "about"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "contacts" && <SubmissionsPanel token={token} source="contact" />}
          {tab === "careers" && <SubmissionsPanel token={token} source="career" />}
          {tab === "about" && <AboutPanel token={token} />}
        </div>
      </div>
    </div>
  );
}

// ─── Submissions Panel (reused for contacts & careers) ──────────────────────
function SubmissionsPanel({ token, source }: { token: string; source: string }) {
  const [contacts, setContacts] = React.useState<AdminContact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    setError("");
    api
      .adminContacts(token, source)
      .then(setContacts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, source]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (contacts.length === 0)
    return <p className="text-muted-foreground">No submissions yet.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{contacts.length} submission(s)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-widest text-muted-foreground">
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Phone</th>
              <th className="pb-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-border/30">
                <td className="py-3 pr-4 text-muted-foreground">{c.id}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4 font-medium">{c.name}</td>
                <td className="py-3 pr-4">
                  <a href={`mailto:${c.email}`} className="text-accent hover:underline">
                    {c.email}
                  </a>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{c.phone || "—"}</td>
                <td className="py-3 max-w-md">
                  <p className="whitespace-pre-wrap text-foreground/80">{c.message}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── About Panel ────────────────────────────────────────────────────────────
function AboutPanel({ token }: { token: string }) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .adminGetAbout(token)
      .then((data) => {
        setTitle(data.title);
        setBody(data.body);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await api.adminUpdateAbout(token, { title, body });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">
          Page Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">
          Content (paragraphs separated by blank lines)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className={cn(inputCls, "min-h-[300px] resize-y")}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-accent">Saved successfully</span>
        )}
      </div>
    </form>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = React.useState<string | null>(() =>
    sessionStorage.getItem("admin_token"),
  );

  function handleLogin(t: string) {
    sessionStorage.setItem("admin_token", t);
    setToken(t);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    setToken(null);
  }

  if (!token) return <LoginForm onLogin={handleLogin} />;
  return <Dashboard token={token} onLogout={handleLogout} />;
}

const inputCls =
  "mt-2 w-full rounded-md border border-border/60 bg-transparent px-3 py-2.5 text-base text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-0";
