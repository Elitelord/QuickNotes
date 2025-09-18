import mongoose from "mongoose";

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_URI");
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      // optional: bufferCommands: false,
    }).then(m => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Define (or get) Note model once (Vercel may re-use lambdas)
const NoteSchema = new mongoose.Schema(
  { title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    urgency: { type: Number, default: 0 } },
  { timestamps: true }
);

export const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);
