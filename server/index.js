import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ----- Mongoose -----
await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
});
console.log("✅ MongoDB connected");

// ----- Schema/Model -----
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" }
  },
  { timestamps: true }
);
const Note = mongoose.model("Note", noteSchema);

// ----- Routes (CRUD) -----
// GET all
app.get("/api/notes", async (_req, res) => {
  const notes = await Note.find().sort({ updatedAt: -1 });
  res.json(notes);
});

// POST create
app.post("/api/notes", async (req, res) => {
  const { title, body } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title required" });
  const note = await Note.create({ title: title.trim(), body: body ?? "" });
  res.status(201).json(note);
});

// PUT update
app.put("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const updated = await Note.findByIdAndUpdate(
    id,
    { ...(title !== undefined ? { title } : {}), ...(body !== undefined ? { body } : {}) },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

// DELETE
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await Note.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 API on http://localhost:${port}`));
