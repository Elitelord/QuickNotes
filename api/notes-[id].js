import { connectToDB, Note } from "./_db.js";

export default async function handler(req, res) {
  try {
    await connectToDB();
    const { id } = req.query;

    if (req.method === "PUT") {
      const patch = req.body || {};
      if (patch.urgency !== undefined) patch.urgency = Number(patch.urgency) || 0;
      const updated = await Note.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const deleted = await Note.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
