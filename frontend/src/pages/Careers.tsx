import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";

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

export default function Careers() {
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
    if (form.message.trim().length < 10) return setError("Tell us a bit more about yourself.");

    setSubmitting(true);
    try {
      await api.contact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        source: "career",
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
    <main className="container pb-24 pt-36 md:pt-44">
      <Reveal>
        <SectionLabel>Careers</SectionLabel>
      </Reveal>

      <Reveal>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
          Join Our Team
        </h1>
      </Reveal>

      <Reveal>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          We're always looking for talented craftsmen, designers, and project
          managers who share our passion for quality and craftsmanship. Leave
          your details below and we'll be in touch.
        </p>
      </Reveal>

      <div className="mt-16 max-w-2xl">
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

          <Field label="Tell us about yourself and your experience" required>
            <textarea
              required
              minLength={10}
              rows={6}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className={cn(inputCls, "min-h-[180px] resize-y")}
              placeholder="Your background, skills, and what role interests you..."
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
              {submitting ? "Sending..." : "Submit Application"}
              {!submitting && <Send className="size-4" />}
            </Button>
            {success && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 text-sm text-accent"
              >
                <CheckCircle2 className="size-4" />
                Thank you — we'll review your application.
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </main>
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
