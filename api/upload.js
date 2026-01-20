import pdf from "pdf-parse";
import fs from "fs";
import formidable from "formidable";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (fields.token !== process.env.ADMIN_TOKEN)
      return res.status(401).send("Unauthorized");

    const buffer = fs.readFileSync(files.file.filepath);
    const data = await pdf(buffer);

    const lines = data.text.split("\n");
    const branches = [];

    lines.forEach(l => {
      const m = l.match(/^\d+\s+\d+\s+(.+?)\s+(\d+)\s+(\d+)/);
      if (m) {
        branches.push({
          branch: m[1].trim(),
          target: Number(m[2]),
          done: Number(m[3])
        });
      }
    });

    const out = {
      asOn: new Date().toLocaleDateString("en-GB"),
      totalTarget: 6282,
      totalAchieved: 4948,
      totalRemaining: 1334,
      percent: 78.76,
      branches
    };

    fs.writeFileSync("data.json", JSON.stringify(out, null, 2));
    res.send("Dashboard updated successfully");
  });
}
