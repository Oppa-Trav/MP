"use client";

import React, { useEffect, useMemo, useState } from "react";

type Student = {
  studentId: string;
  name: string;
  email: string;
};

const API_BASE = "https://mtb2dyjd62.execute-api.us-east-1.amazonaws.com/default";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // which action is running
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Add form
  const [addId, setAddId] = useState("");
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");

  // Update form
  const [updId, setUpdId] = useState("");
  const [updName, setUpdName] = useState("");
  const [updEmail, setUpdEmail] = useState("");

  // Delete
  const [delId, setDelId] = useState("");

  const endpointStudents = useMemo(() => `${API_BASE}/students`, []);

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
      console.error(e);
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

      setMessage("Student added.");
      setAddId("");
      setAddName("");
      setAddEmail("");
      await fetchStudents();
    } catch (e: any) {
      console.error(e);
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

      const res = await fetch(`${endpointStudents}/${encodeURIComponent(updId.trim())}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(updName.trim() ? { name: updName.trim() } : {}),
          ...(updEmail.trim() ? { email: updEmail.trim() } : {}),
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Update failed (HTTP ${res.status}): ${text}`);

      setMessage("Student updated.");
      setUpdName("");
      setUpdEmail("");
      await fetchStudents();
    } catch (e: any) {
      console.error(e);
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

      const res = await fetch(`${endpointStudents}/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Delete failed (HTTP ${res.status}): ${text}`);

      setMessage(`Deleted ${targetId}.`);
      if (!id) setDelId("");
      await fetchStudents();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to delete student.");
    } finally {
      setBusy(null);
    }
  }

  function fillUpdateFromRow(s: Student) {
    setUpdId(s.studentId);
    setUpdName(s.name);
    setUpdEmail(s.email);
    setMessage("Loaded student into Update form.");
    setError("");
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Students Manager</h1>
          <p style={styles.sub}>
            Connected to <span style={styles.mono}>{endpointStudents}</span>
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={fetchStudents}
            disabled={loading || !!busy}
            className={cx("btn", "primary")}
            style={buttonStyle("primary")}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {(message || error) && (
        <div
          style={{
            ...styles.alert,
            ...(error ? styles.alertError : styles.alertOk),
          }}
        >
          <strong>{error ? "Error" : "Info"}:</strong>{" "}
          <span style={{ marginLeft: 8 }}>{error || message}</span>
        </div>
      )}

      <section style={styles.grid}>
        {/* Add */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.h2}>Add Student (POST)</h2>
            <span style={styles.badge}>/students</span>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.label}>
              Student ID
              <input
                style={styles.input}
                value={addId}
                onChange={(e) => setAddId(e.target.value)}
                placeholder="e.g. 2304259A"
              />
            </label>

            <label style={styles.label}>
              Name
              <input
                style={styles.input}
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Isaac Tan"
              />
            </label>

            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="e.g. 2304259A@student.tp.edu.sg"
              />
            </label>
          </div>

          <button
            onClick={addStudent}
            disabled={busy === "add"}
            style={buttonStyle("primary")}
          >
            {busy === "add" ? "Adding…" : "Add Student"}
          </button>
        </div>

        {/* Update */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.h2}>Update Student (PUT)</h2>
            <span style={styles.badge}>/students/&lt;studentId&gt;</span>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.label}>
              Student ID (required)
              <input
                style={styles.input}
                value={updId}
                onChange={(e) => setUpdId(e.target.value)}
                placeholder="e.g. 2304259A"
              />
            </label>

            <label style={styles.label}>
              Name (optional)
              <input
                style={styles.input}
                value={updName}
                onChange={(e) => setUpdName(e.target.value)}
                placeholder="New name"
              />
            </label>

            <label style={styles.label}>
              Email (optional)
              <input
                style={styles.input}
                value={updEmail}
                onChange={(e) => setUpdEmail(e.target.value)}
                placeholder="New email"
              />
            </label>
          </div>

          <button
            onClick={updateStudent}
            disabled={busy === "update"}
            style={buttonStyle("secondary")}
          >
            {busy === "update" ? "Updating…" : "Update Student"}
          </button>

          <p style={styles.help}>
            Tip: click a row’s <strong>Edit</strong> button to load data here.
          </p>
        </div>

        {/* Delete */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.h2}>Delete Student (DELETE)</h2>
            <span style={styles.badge}>/students/&lt;studentId&gt;</span>
          </div>

          <label style={styles.label}>
            Student ID
            <input
              style={styles.input}
              value={delId}
              onChange={(e) => setDelId(e.target.value)}
              placeholder="e.g. 2304259A"
            />
          </label>

          <button
            onClick={() => deleteStudent()}
            disabled={busy === "delete"}
            style={buttonStyle("danger")}
          >
            {busy === "delete" ? "Deleting…" : "Delete Student"}
          </button>

          <p style={styles.help}>
            Or use the <strong>Delete</strong> button in the table.
          </p>
        </div>
      </section>

      {/* Table */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.h2}>All Students (GET)</h2>
          <span style={styles.badge}>/students</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && !loading ? (
                <tr>
                  <td style={styles.td} colSpan={4}>
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.studentId}>
                    <td style={styles.tdMono}>{s.studentId}</td>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.email}</td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => fillUpdateFromRow(s)}
                          style={buttonStyle("ghost")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStudent(s.studentId)}
                          disabled={busy === "delete"}
                          style={buttonStyle("dangerGhost")}
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

        <p style={styles.footerNote}>
          Note: this page is a simple API tester for your serverless backend.
        </p>
      </section>
    </main>
  );
}

/** Inline styles (simple, no Tailwind needed) */
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 24,
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: "#111827",
  },
  header: {
    display: "flex",
    gap: 16,
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  headerActions: { display: "flex", gap: 10 },
  h1: { fontSize: 34, margin: 0, letterSpacing: -0.5 },
  sub: { margin: "6px 0 0", color: "#6B7280" },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
    background: "#F3F4F6",
    padding: "2px 6px",
    borderRadius: 6,
  },
  alert: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid",
    marginBottom: 18,
  },
  alertOk: {
    background: "#ECFDF5",
    borderColor: "#A7F3D0",
    color: "#065F46",
  },
  alertError: {
    background: "#FEF2F2",
    borderColor: "#FECACA",
    color: "#991B1B",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  h2: { fontSize: 16, margin: 0 },
  badge: {
    fontSize: 12,
    background: "#F3F4F6",
    padding: "4px 8px",
    borderRadius: 999,
    color: "#374151",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 13,
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #D1D5DB",
    outline: "none",
    fontSize: 14,
  },
  formGrid: {
    display: "grid",
    gap: 12,
    marginBottom: 12,
  },
  help: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 12,
    color: "#6B7280",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    padding: "10px 12px",
    background: "#F9FAFB",
    borderBottom: "1px solid #E5E7EB",
    color: "#374151",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #F3F4F6",
    fontSize: 14,
    verticalAlign: "top",
  },
  tdMono: {
    padding: "10px 12px",
    borderBottom: "1px solid #F3F4F6",
    fontSize: 13,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  footerNote: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 12,
    color: "#6B7280",
  },
};

function buttonStyle(kind: "primary" | "secondary" | "danger" | "ghost" | "dangerGhost") {
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  };

  switch (kind) {
    case "primary":
      return { ...base, background: "#111827", color: "white" };
    case "secondary":
      return { ...base, background: "#2563EB", color: "white" };
    case "danger":
      return { ...base, background: "#DC2626", color: "white" };
    case "ghost":
      return {
        ...base,
        background: "#FFFFFF",
        borderColor: "#D1D5DB",
        color: "#111827",
      };
    case "dangerGhost":
      return {
        ...base,
        background: "#FFFFFF",
        borderColor: "#FCA5A5",
        color: "#B91C1C",
      };
  }
}