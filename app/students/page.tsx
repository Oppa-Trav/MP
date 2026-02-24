"use client";

import React, { useEffect, useMemo, useState } from "react";

type Student = { studentId: string; name: string; email: string };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://mtb2dyjd62.execute-api.us-east-1.amazonaws.com/default";

const LOGO_URL = "https://student-manager-assets.s3.us-east-1.amazonaws.com/icon.png"; 

function classNames(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function StudentsPage() {
  const endpointStudents = useMemo(() => `${API_BASE}/students`, []);
  const shortEndpoint = useMemo(() => {
    const pretty = endpointStudents.replace("https://", "");
    return pretty.length > 52 ? `${pretty.slice(0, 52)}…` : pretty;
  }, [endpointStudents]);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<"add" | "update" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search
  const [query, setQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      `${s.studentId} ${s.name} ${s.email}`.toLowerCase().includes(q)
    );
  }, [students, query]);

  // Add
  const [addId, setAddId] = useState("");
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");

  // Update
  const [updId, setUpdId] = useState("");
  const [updName, setUpdName] = useState("");
  const [updEmail, setUpdEmail] = useState("");

  // Delete
  const [delId, setDelId] = useState("");

  async function fetchStudents() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(endpointStudents, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed (HTTP ${res.status})`);
      const data = (await res.json()) as Student[];
      setStudents(data);
      setMessage(`Loaded ${data.length} student(s).`);
    } catch (e: any) {
      setError(e?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addStudent() {
    setError("");
    setMessage("");
    setBusy("add");
    try {
      if (!addId.trim() || !addName.trim() || !addEmail.trim()) {
        throw new Error("Add: studentId, name, and email are required.");
      }
      const res = await fetch(endpointStudents, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: addId.trim(),
          name: addName.trim(),
          email: addEmail.trim(),
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Add failed (HTTP ${res.status}): ${text}`);

      setAddId("");
      setAddName("");
      setAddEmail("");
      setMessage("Student added.");
      await fetchStudents();
    } catch (e: any) {
      setError(e?.message || "Failed to add student.");
    } finally {
      setBusy(null);
    }
  }

  async function updateStudent() {
    setError("");
    setMessage("");
    setBusy("update");
    try {
      if (!updId.trim()) throw new Error("Update: studentId is required.");
      if (!updName.trim() && !updEmail.trim()) {
        throw new Error("Update: provide at least name or email.");
      }

      const res = await fetch(
        `${endpointStudents}/${encodeURIComponent(updId.trim())}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(updName.trim() ? { name: updName.trim() } : {}),
            ...(updEmail.trim() ? { email: updEmail.trim() } : {}),
          }),
        }
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`Update failed (HTTP ${res.status}): ${text}`);

      setUpdName("");
      setUpdEmail("");
      setMessage("Student updated.");
      await fetchStudents();
    } catch (e: any) {
      setError(e?.message || "Failed to update student.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteStudent(id?: string) {
    const targetId = (id ?? delId).trim();
    setError("");
    setMessage("");
    setBusy("delete");
    try {
      if (!targetId) throw new Error("Delete: studentId is required.");

      const ok = confirm(`Delete student "${targetId}"? This cannot be undone.`);
      if (!ok) return;

      const res = await fetch(
        `${endpointStudents}/${encodeURIComponent(targetId)}`,
        { method: "DELETE" }
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`Delete failed (HTTP ${res.status}): ${text}`);

      if (!id) setDelId("");
      setMessage(`Deleted ${targetId}.`);
      await fetchStudents();
    } catch (e: any) {
      setError(e?.message || "Failed to delete student.");
    } finally {
      setBusy(null);
    }
  }

  function fillUpdateFromRow(s: Student) {
    setUpdId(s.studentId);
    setUpdName(s.name);
    setUpdEmail(s.email);
    setMessage("Loaded into Update form.");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {LOGO_URL ? (
              <img
                src={LOGO_URL}
                alt="Logo"
                className="h-10 w-10 rounded-xl border border-slate-200 bg-white object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                SM
              </div>
            )}

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Students Manager
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Automated Web Application Deployment • AWS + IaC
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Connected to{" "}
                <span
                  title={endpointStudents}
                  className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700"
                >
                  {shortEndpoint}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchStudents}
            disabled={loading || !!busy}
            className={classNames(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Alerts */}
        {(message || error) && (
          <div
            className={classNames(
              "mb-6 rounded-2xl border px-4 py-3 text-sm",
              error
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            )}
          >
            <span className="font-semibold">{error ? "Error:" : "Info:"}</span>{" "}
            {error || message}
          </div>
        )}

        {/* Action cards */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Add */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Add Student</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                POST /students
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Student ID">
                <input
                  className="input"
                  value={addId}
                  onChange={(e) => setAddId(e.target.value)}
                  placeholder="e.g. 2400123A"
                />
              </Field>
              <Field label="Name">
                <input
                  className="input"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Amelia Koh"
                />
              </Field>
              <Field label="Email">
                <input
                  className="input"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. 2400123A@student.tp.edu.sg"
                />
              </Field>

              <button
                onClick={addStudent}
                disabled={busy === "add"}
                className={classNames(
                  "mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold",
                  "bg-slate-900 text-white hover:bg-slate-800",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {busy === "add" ? "Adding…" : "Add Student"}
              </button>
            </div>
          </div>

          {/* Update */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Update Student</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                PUT /students/&lt;id&gt;
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Student ID (required)">
                <input
                  className="input"
                  value={updId}
                  onChange={(e) => setUpdId(e.target.value)}
                  placeholder="e.g. 2400456B"
                />
              </Field>
              <Field label="Name (optional)">
                <input
                  className="input"
                  value={updName}
                  onChange={(e) => setUpdName(e.target.value)}
                  placeholder="New name"
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  className="input"
                  value={updEmail}
                  onChange={(e) => setUpdEmail(e.target.value)}
                  placeholder="New email"
                />
              </Field>

              <button
                onClick={updateStudent}
                disabled={busy === "update"}
                className={classNames(
                  "mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold",
                  "bg-blue-600 text-white hover:bg-blue-500",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {busy === "update" ? "Updating…" : "Update Student"}
              </button>

              <p className="text-xs text-slate-500">
                Tip: click <span className="font-semibold">Edit</span> in the table to load
                a student here.
              </p>
            </div>
          </div>

          {/* Delete */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Delete Student</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                DELETE /students/&lt;id&gt;
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Student ID">
                <input
                  className="input"
                  value={delId}
                  onChange={(e) => setDelId(e.target.value)}
                  placeholder="e.g. 2400999D"
                />
              </Field>

              <button
                onClick={() => deleteStudent()}
                disabled={busy === "delete"}
                className={classNames(
                  "mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold",
                  "bg-rose-600 text-white hover:bg-rose-500",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {busy === "delete" ? "Deleting…" : "Delete Student"}
              </button>

              <p className="text-xs text-slate-500">
                You will be asked to confirm before deletion.
              </p>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">All Students</h3>
              <p className="mt-1 text-xs text-slate-500">GET /students</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className="input w-full sm:w-64"
                placeholder="Search students…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                {filteredStudents.length} record(s)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-600">
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 && !loading ? (
                  <tr>
                    <td className="px-5 py-4 text-sm text-slate-500" colSpan={4}>
                      No matching students.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono text-sm text-slate-900">
                        {s.studentId}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900">{s.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{s.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => fillUpdateFromRow(s)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStudent(s.studentId)}
                            disabled={busy === "delete"}
                            className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 text-xs text-slate-500">
            Showing <span className="font-semibold">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold">{students.length}</span> student(s).
          </div>
        </section>

        <footer className="mx-auto mt-8 max-w-6xl px-1 pb-10 text-xs text-slate-400">
          v1.0 • Environment: {process.env.NODE_ENV} • Next.js + AWS (API Gateway, Lambda,
          DynamoDB) • Containerized with Docker
        </footer>
      </main>

      {/* Helper input style */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: rgb(148 163 184);
          box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.25);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}