const BASE_URL = import.meta.env.PROD ? "" : "http://localhost:8080";

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Errore HTTP ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}
