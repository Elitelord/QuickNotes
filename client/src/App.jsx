import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [editing, setEditing] = useState(null); // note _id being edited
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/notes");
      setNotes(data);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const submitNew = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const { data } = await axios.post("/api/notes", form);
      setNotes((prev) => [data, ...prev]);
      setForm({ title: "", body: "" });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  const startEdit = (note) => {
    setEditing(note._id);
  };

  const saveEdit = async (id, patch) => {
    try {
      const { data } = await axios.put(`/api/notes/${id}`, patch);
      setNotes((prev) => prev.map((n) => (n._id === id ? data : n)));
      setEditing(null);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete note?")) return;
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "24px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>QuickNotes (MERN)</h1>

      <form onSubmit={submitNew} style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          required
        />
        <textarea
          placeholder="Body (optional)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={3}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#111", color: "white" }}>
          Add Note
        </button>
      </form>

      {err && <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 8, marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

      <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
        {notes.map((n) => (
          <li key={n._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            {editing === n._id ? (
              <EditCard note={n} onSave={saveEdit} onCancel={() => setEditing(null)} />
            ) : (
              <ViewCard note={n} onEdit={() => startEdit(n)} onDelete={() => remove(n._id)} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ViewCard({ note, onEdit, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{note.title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={btn}>Edit</button>
          <button onClick={onDelete} style={{ ...btn, background: "#b00020" }}>Delete</button>
        </div>
      </div>
      {note.body && <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{note.body}</p>}
      <small style={{ color: "#666" }}>
        Updated: {new Date(note.updatedAt).toLocaleString()}
      </small>
    </div>
  );
}

function EditCard({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body ?? "");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
      <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} style={input} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(note._id, { title, body })} style={btn}>Save</button>
        <button onClick={onCancel} style={{ ...btn, background: "#999" }}>Cancel</button>
      </div>
    </div>
  );
}

const btn = { padding: "8px 12px", borderRadius: 8, border: "none", background: "#111", color: "white", cursor: "pointer" };
const input = { padding: 10, borderRadius: 8, border: "1px solid #ddd" };
