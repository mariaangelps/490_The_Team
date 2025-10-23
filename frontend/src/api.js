const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // IMPORTANT for session cookie
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data?.error || { message: "Request failed" };
  return data;
}
