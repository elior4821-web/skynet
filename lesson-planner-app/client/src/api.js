const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `שגיאה (${res.status})`);
  }
  return res;
}

export async function getMeta() {
  return (await request("/meta")).json();
}

export async function getHealth() {
  return (await request("/health")).json();
}

export async function generateContent(payload) {
  return (
    await request("/generate", { method: "POST", body: JSON.stringify(payload) })
  ).json();
}

export async function listLessonPlans() {
  return (await request("/lesson-plans")).json();
}

export async function saveLessonPlan(payload) {
  return (
    await request("/lesson-plans", { method: "POST", body: JSON.stringify(payload) })
  ).json();
}

export async function deleteLessonPlan(id) {
  await request(`/lesson-plans/${id}`, { method: "DELETE" });
}

export async function listReferences() {
  return (await request("/references")).json();
}

export async function uploadReference(subject, file) {
  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("file", file);
  return (await request("/references", { method: "POST", body: formData })).json();
}

export async function deleteReference(id) {
  await request(`/references/${id}`, { method: "DELETE" });
}

export async function exportFile(format, { title, content }) {
  const res = await request(`/export/${format}`, {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "document"}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
