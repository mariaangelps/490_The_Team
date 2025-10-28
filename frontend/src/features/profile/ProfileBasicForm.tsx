import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

// --- UI primitives (shadcn-like fallbacks) ---
// Replace these with your design system if you already have them.
function Label({ htmlFor, children }: React.PropsWithChildren<{ htmlFor?: string }>) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
}
function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { rightEl?: React.ReactNode }
) {
  const { rightEl, ...rest } = props;
  return (
    <div className="relative">
      <input
        {...rest}
        className={[
          "w-full rounded-2xl border border-gray-300 px-3 py-2",
          "focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-400",
          rest.className ?? "",
        ].join(" ")}
      />
      {rightEl ? <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs 
text-gray-400">{rightEl}</div> : null}
    </div>
  );
}
function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { counter?: { value: 
number; max: number } }
) {
  const { counter, ...rest } = props;
  return (
    <div className="relative">
      <textarea
        {...rest}
        className={[
          "w-full min-h-[120px] rounded-2xl border border-gray-300 px-3 py-2",
          "focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-400",
          rest.className ?? "",
        ].join(" ")}
      />
      {counter ? (
        <div className="absolute right-2 bottom-2 text-[11px] text-gray-400 
select-none">
          {counter.value}/{counter.max}
        </div>
      ) : null}
    </div>
  );
}
function Select({ value, onChange, children, placeholder }: any) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm 
focus:outline-none focus:ring-4 focus:ring-black/5"
    >
      <option value="" disabled>
        {placeholder ?? "Select…"}
      </option>
      {children}
    </select>
  );
}
function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const { variant = "primary", className, ...rest } = props;
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-black/90 focus:ring-black/20"
      : "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300/40";

  return (
    <button
      {...rest}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-4",
        styles,
        className ?? "",
      ].join(" ")} // 👈 esto cierra correctamente el arreglo
    />
  );
}

function Card({ children }: React.PropsWithChildren) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {children}
    </div>
  );
}
function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-4 border-b border-gray-100">
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
    </div>
  );
}
function CardContent({ children }: React.PropsWithChildren) {
  return <div className="p-4">{children}</div>;
}
function InlineError({ children }: React.PropsWithChildren) {
  if (!children) return null;
  return <p className="mt-1 text-[12px] text-red-600">{children}</p>;
}

// --- Types ---
export type BasicProfile = {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  headline?: string;
  bio?: string; // max 500
  industry?: string;
  experience?: "Entry" | "Mid" | "Senior" | "Executive" | "";
};

// --- Mock API util (replace with your real API client) ---
async function saveBasicProfile(data: BasicProfile) {
  const res = await fetch("/api/profile/basic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to save profile");
  }
  return await res.json();
}

// --- Validation helpers ---
function isEmail(x: string) {
  return /.+@.+\..+/.test(x);
}
function isPhone(x: string) {
  // very permissive: digits, spaces, +, -, parentheses; optional
  return /^$|^[+()\d\-\s]{7,}$/.test(x);
}

export default function ProfileBasicForm({
  initial,
  onCancel,
  onSuccess,
}: {
  initial?: Partial<BasicProfile>;
  onCancel?: () => void;
  onSuccess?: (saved: any) => void;
}) {
  const [form, setForm] = useState<BasicProfile>({
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    headline: initial?.headline ?? "",
    bio: initial?.bio ?? "",
    industry: initial?.industry ?? "",
    experience: (initial?.experience as any) ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"" | "success" | "error">("");
  const bioCount = form.bio?.length ?? 0;
  const usStates = useMemo(
    () => [
      "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
      "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
      "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
      "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
      "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
      "DC"
    ],
    []
  );
  const industries = useMemo(
    () => [
      "Software",
      "Finance",
      "Healthcare",
      "Education",
      "Retail",
      "Manufacturing",
      "Consulting",
      "Other",
    ],
    []
  );

  function set<K extends keyof BasicProfile>(key: K, value: BasicProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!isEmail(form.email)) e.email = "Enter a valid email";

    if (!isPhone(form.phone || "")) e.phone = "Enter a valid phone (or leave blank)";

    if (bioCount > 500) e.bio = "Bio must be at most 500 characters";

    if (!form.industry) e.industry = "Select an industry";
    if (!form.experience) e.experience = "Select experience level";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setStatus("");
    if (!validate()) return;
    setBusy(true);
    try {
      const saved = await saveBasicProfile({ ...form, bio: (form.bio || "").slice(0, 
500) });
      setStatus("success");
      setForm({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        headline: "",
        bio: "",
        industry: "",
        experience: "",
      });
      onSuccess?.(saved);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader title="Basic Profile Information" subtitle="Complete your 
professional profile" />
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 
gap-4">
              {/* Full name */}
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="fullName">Full name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="e.g., Jane Doe"
                />
                <InlineError>{errors.fullName}</InlineError>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                />
                <InlineError>{errors.email}</InlineError>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <InlineError>{errors.phone}</InlineError>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Newark"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={form.state}
                  onChange={(e: any) => set("state", e.target.value)}
                  placeholder="Select state"
                >
                  {usStates.map((abbrev) => (
                    <option key={abbrev} value={abbrev}>
                      {abbrev}
                    </option>
                  ))}
                </Select>
              </div>


              {/* Headline */}
              <div className="md:col-span-2">
                <Label htmlFor="headline">Professional headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="e.g., Software Engineer · Full‑Stack · React/Node"
                />
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={form.industry}
                  onChange={(e: any) => set("industry", e.target.value)}
                  placeholder="Select industry"
                >
                  {industries.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
                <InlineError>{errors.industry}</InlineError>
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experience">Experience level *</Label>
                <Select
                  value={form.experience}
                  onChange={(e: any) => set("experience", e.target.value)}
                  placeholder="Select level"
                >
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </Select>
                <InlineError>{errors.experience}</InlineError>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <Label htmlFor="bio">Brief bio (max 500)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Tell us about yourself, achievements, and interests…"
                  counter={{ value: bioCount, max: 500 }}
                />
                <InlineError>{errors.bio}</InlineError>
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
                {status === "success" && (
                  <span className="text-sm text-green-600">Saved successfully ✔</span>
                )}
                {status === "error" && (
                  <span className="text-sm text-red-600">Could not save. Try 
again.</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

