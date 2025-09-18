import { connectToDB, Note } from "./_db.js";

export default async function handler(req, res) {
  try {
    await connectToDB();

    if (req.method === "GET") {
      const notes = await Note.find().sort({ updatedAt: -1 });
      return res.status(200).json(notes);
    }

    if (req.method === "POST") {
      const { title, body, urgency } = req.body || {};
      if (!title || !title.trim()) return res.status(400).json({ error: "Title required" });
      const note = await Note.create({ title: title.trim(), body: body ?? "", urgency: Number(urgency) || 0 });
      return res.status(201).json(note);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
