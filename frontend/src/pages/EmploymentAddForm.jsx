import React, { useState } from "react";
import { motion } from "framer-motion";

/* =======================
   UI PRIMITIVES (ligeros)
   ======================= */
function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children}
    </label>
  );
}

function Input({ rightEl, className, ...rest }) {
  return (
    <div className="relative">
      <input
        {...rest}
        className={[
          "w-full rounded-2xl border px-3 py-2 transition",
          "focus:outline-none focus:ring-4",
          className ?? "",
        ].join(" ")}
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
          borderColor: "var(--border-color)",
        }}
      />
      {rightEl ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70">
          {rightEl}
        </div>
      ) : null}
    </div>
  );
}

function Textarea({ counter, className, ...rest }) {
  return (
    <div className="relative">
      <textarea
        {...rest}
        className={[
          "w-full min-h-[120px] rounded-2xl border px-3 py-2 transition",
          "focus:outline-none focus:ring-4",
          className ?? "",
        ].join(" ")}
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
          borderColor: "var(--border-color)",
        }}
      />
      {counter ? (
        <div className="absolute right-2 bottom-2 text-[11px] opacity-70 select-none">
          {counter.value}/{counter.max}
        </div>
      ) : null}
    </div>
  );
}

function Select({ placeholder, className, children, ...rest }) {
  return (
    <select
      {...rest}
      className={[
        "w-full rounded-2xl border bg-transparent px-3 py-2 text-sm",
        "focus:outline-none focus:ring-4",
        className ?? "",
      ].join(" ")}
      style={{
        color: "var(--text-color)",
        borderColor: "var(--border-color)",
      }}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {children}
    </select>
  );
}

function Button({ variant = "primary", className, ...rest }) {
  const style =
    variant === "primary"
      ? {
          backgroundColor: "var(--accent-color)",
          color: "var(--bg-color)",
          borderColor: "var(--accent-color)",
        }
      : {
          backgroundColor: "transparent",
          color: "var(--text-color)",
          borderColor: "var(--border-color)",
        };
  return (
    <button
      {...rest}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-medium transition",
        "focus:outline-none focus:ring-4 border",
        className ?? "",
      ].join(" ")}
      style={style}
    />
  );
}

function Card({ children }) {
  return (
    <div
      className="rounded-2xl border shadow-sm"
      style={{
        backgroundColor: "var(--bg-color)",
        borderColor: "var(--border-color)",
      }}
    >
      {children}
    </div>
  );
}
function CardHeader({ title, subtitle }) {
  return (
    <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm opacity-70 mt-1">{subtitle}</p> : null}
    </div>
  );
}
function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}
function InlineError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[12px]" style={{ color: "#dc2626" }}>
      {children}
    </p>
  );
}

/* =======================
   API
   ======================= */
async function saveEmployment(entry) {
  // Ajusta si usas API_URL: `${API_URL}/api/employment/add`
  const res = await fetch("/api/employment/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* =======================
   COMPONENT
   ======================= */
export default function EmploymentAddForm({ initial, onCancel, onSuccess }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    company: initial?.company ?? "",
    location: initial?.location ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    current: initial?.current ?? false,
    description: (initial?.description ?? "").slice(0, 1000),
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const descCount = form.description?.length ?? 0;

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.current && !form.endDate) e.endDate = "End date is required unless Current is checked";

    if (form.startDate && form.endDate && !form.current) {
      const s = new Date(form.startDate).getTime();
      const en = new Date(form.endDate).getTime();
      if (isFinite(s) && isFinite(en) && s > en) e.endDate = "End date must be after start date";
    }
    if ((form.description || "").length > 1000) e.description = "Description must be at most 1000 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setStatus("");
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {
        ...form,
        description: (form.description || "").slice(0, 1000),
        endDate: form.current ? "" : form.endDate,
      };
      const saved = await saveEmployment(payload);
      setStatus("success");
      setForm({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
      onSuccess && onSuccess(saved);
    } catch (err) {
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
          <CardHeader title="Add Employment Entry" subtitle="Document your work experience" />
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="title">Job title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
                <InlineError>{errors.title}</InlineError>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                  placeholder="e.g., Acme Corp"
                />
                <InlineError>{errors.company}</InlineError>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="City, State (or Remote)"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  placeholder="yyyy-mm-dd"
                />
                <InlineError>{errors.startDate}</InlineError>
              </div>

              <div>
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField("endDate", e.target.value)}
                  placeholder="yyyy-mm-dd"
                  disabled={form.current}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="current"
                    type="checkbox"
                    checked={form.current}
                    onChange={(e) => setField("current", e.target.checked)}
                  />
                  <Label htmlFor="current">Current position</Label>
                </div>
                <InlineError>{errors.endDate}</InlineError>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Job description (max 1000)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  maxLength={1000}
                  placeholder="Responsibilities, achievements, stack…"
                  counter={{ value: descCount, max: 1000 }}
                />
                <InlineError>{errors.description}</InlineError>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
                {status === "success" && (
                  <span className="text-sm" style={{ color: "#16a34a" }}>
                    Saved successfully ✔
                  </span>
                )}
                {status === "error" && (
                  <span className="text-sm" style={{ color: "#dc2626" }}>
                    Could not save. Try again.
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
