export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { brief, daysLeft } = req.body;
  if (!brief) return res.status(400).json({ error: "Brief is missing" });

  const system = `You break assignments into small, doable tasks for a student.
Reply with ONLY valid JSON in this shape:
{"tasks":[{"title":"short action","day":1,"minutes":30}]}
Rules: spread tasks across the days available, keep each task under 90 minutes, start with the easiest step, and end with a review/submit task.`;

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Days until deadline: ${daysLeft}\n\nAssignment:\n${brief}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );

    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: data.error?.message || "AI error" });
    }

    const text = data.candidates[0].content.parts[0].text
      .replace(/```json|```/g, "")
      .trim();
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ error: "Could not build the plan. Try again." });
  }
}
