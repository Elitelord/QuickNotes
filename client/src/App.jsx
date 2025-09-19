  import { useEffect, useState } from "react";
  import axios from "axios";

  export default function App() {
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({ title: "", body: "", urgency: 0});
    const [editing, setEditing] = useState(null); // note _id being edited
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [sortBy, setSortBy] = useState("date");
    axios.defaults.baseURL = "";
    const fetchNotes = async () => {
      
      setLoading(true);
      try {
        const { data } = await axios.get("/api/notes");
        const sortedData = [...data].sort((a, b) => {
          if (sortBy === "urgency") return b.urgency - a.urgency;
          if (sortBy === "date") return new Date(b.updatedAt) - new Date(a.updatedAt);
          return 0;
        })
        setNotes(sortedData);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };

     useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/notes");
        setNotes(data);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

    const submitNew = async (e) => {
      e.preventDefault();
      if (!form.title.trim()) return;
      try {
        const { data } = await axios.post("/api/notes", form);
        setNotes((prev) => [data, ...prev]);
        setForm({ title: "", body: "", urgency: 0});
      } catch (e) {
        setErr(e?.response?.data?.error || e.message);
      }
    };

    const startEdit = (note) => {
      setEditing(note._id);
    };

  const saveEdit = async (id, patch) => {
    try {
      const { data } = await axios.put(`/api/notes/${id}`, {
        ...patch,
        urgency: patch.urgency !== undefined ? Number(patch.urgency) || 0 : undefined,
      });
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
    const handleUrgency = () => {
      // setLoading(true);
      // try {
      //   const { data } = await axios.get("/api/notes");
      //   const sortedData = [...data].sort((a, b) => {
      //     return b.urgency - a.urgency;
      //   })
      //   setNotes(sortedData);
      // } catch (e) {
      //   setErr(e?.response?.data?.error || e.message);
      // } finally {
      //   setLoading(false);
      // }
      setSortBy("urgency");
    }
    const handleDate = () => {
      // setLoading(true);
      // try {
      //   const { data } = await axios.get("/api/notes");
      //   const sortedData = [...data].sort((a, b) => {
      //   return new Date(b.updatedAt) - new Date(a.updatedAt);
      //   })
      //   setNotes(sortedData);
      // } catch (e) {
      //   setErr(e?.response?.data?.error || e.message);
      // } finally {
      //   setLoading(false);
      // }
      setSortBy("date");
    }
    const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === "urgency") return (Number(b.urgency) || 0) - (Number(a.urgency) || 0);
    // default: date
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
    return (
      <div style={{
        width: "100%",
        minHeight: "100vh",
        display: "grid",
        justifyItems: "center",   
        alignContent: "start",    
        padding: 200,
        background: "#222",
      }}>
      <div style={{width: 500, padding: 20, fontFamily: "system-ui, sans-serif" }}>
        <h1>QuickNotes</h1>

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
          <label> Level of Urgency: </label>
          <input 
          placeholder= {0}
          value = {form.urgency}
          onChange={(e) => setForm({ ...form, urgency: e.target.value})}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#111", color: "white" }}>
            Add Note
          </button>
        </form>

        {err && <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 8, marginBottom: 12 }}>{err}</div>}
        {loading && <div>Loading…</div>}

        <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
          <button onClick = {handleUrgency} style={btn}>Sort by Urgency</button>
          <button onClick = {handleDate} style={btn}>Sort by Date</button>
          {sortedNotes.map((n) => (
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
        <hr></hr>
        <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }} ><b>Level of Urgency</b></p>
        {note.urgency && <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{note.urgency}</p>}
        <br></br>
        <small style={{ color: "#666" }}>
          Updated: {new Date(note.updatedAt).toLocaleString()}
        </small>
      </div>
    );
  }

  function EditCard({ note, onSave, onCancel }) {
    const [title, setTitle] = useState(note.title);
    const [body, setBody] = useState(note.body ?? "");
    const [urgency, setUrgency] = useState(note.urgency ?? 0);
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
        <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} style={input} />
        <input value = {urgency} onChange={(e) => setUrgency(e.target.value)} style = {input}/>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onSave(note._id, { title, body, urgency })} style={btn}>Save</button>
          <button onClick={onCancel} style={{ ...btn, background: "#999" }}>Cancel</button>
        </div>
      </div>
    );
  }

  const btn = { padding: "8px 12px", borderRadius: 8, border: "none", background: "#111", color: "white", cursor: "pointer" };
  const input = { padding: 10, borderRadius: 8, border: "1px solid #ddd" };
