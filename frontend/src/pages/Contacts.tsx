import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: FormState = { name: "", email: "", phone: "", message: "" };

export default function Contacts() {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError("Please tell us your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email.");
    if (form.message.trim().length < 10) return setError("Please share a few words about your project.");

    setSubmitting(true);
    try {
      await api.contact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="container pb-12 pt-32 md:pt-44">
        <SectionLabel index="◆">Begin</SectionLabel>
        <Reveal className="mt-6 max-w-4xl">
          <h1 className="font-display text-display-lg text-balance">
            Tell us about your project.
          </h1>
        </Reveal>
        <Reveal delay={0.05} className="mt-6 max-w-2xl">
          <p className="text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
            We typically respond within two business days. The more you share — the
            room, the timeline, the way you live — the more useful our first
            conversation can be.
          </p>
        </Reveal>
      </section>

      <section className="container py-12 md:py-20">
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-16">
          {/* Form */}
          <div className="col-span-12 md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
              <Field label="Name" required>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <Field label="Email" required>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Tell us about your project" required>
                <textarea
                  required
                  minLength={10}
                  rows={6}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className={cn(inputCls, "min-h-[180px] resize-y")}
                  placeholder="The room, the timeline, the way you cook…"
                />
              </Field>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex items-center gap-4 pt-2">
                <Button type="submit" size="lg" variant="primary" disabled={submitting}>
                  {submitting ? "Sending…" : "Send Inquiry"}
                  {!submitting && <Send className="size-4" />}
                </Button>
                {success && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 text-sm text-accent"
                  >
                    <CheckCircle2 className="size-4" />
                    Thank you — we'll be in touch.
                  </motion.span>
                )}
              </div>
            </form>
          </div>

          {/* Studio info */}
          <aside className="col-span-12 md:col-span-5">
            <div className="rounded-md border border-border/60 bg-surface/40 p-8 md:p-10">
              <h3 className="font-display text-2xl">The studio</h3>
              <p className="mt-2 text-sm text-muted-foreground">SCI Seattle Cabinets &amp; Interiors</p>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-accent" />
                  <div>
                    <p className="text-foreground">17631 147th St SE</p>
                    <p className="text-muted-foreground">Monroe, WA 98272</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-accent" />
                  <a href="mailto:litwinshop@gmail.com" className="hover:text-accent">
                    litwinshop@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-accent" />
                  <a href="tel:+12068185057" className="hover:text-accent">
                    206.818.5057
                  </a>
                </li>
              </ul>

              <div className="mt-10 border-t border-border/60 pt-6">
                <p className="text-xs uppercase tracking-widest2 text-muted-foreground">
                  Hours
                </p>
                <p className="mt-3 text-sm text-foreground/80">
                  Mon–Fri · 9am — 5pm <br />
                  Studio visits by appointment
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-0";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest2 text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
