const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

async function callGemini(model, system, userText) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  const data = await r.json();
  if (!r.ok) {
    const err = new Error(data.error?.message || "AI error");
    err.status = r.status;
    throw err;
  }
  const text = data.candidates[0].content.parts[0].text
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(text);
}

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

  const userText = `Days until deadline: ${daysLeft}\n\nAssignment:\n${brief}`;

  let lastError = "Could not build the plan. Try again.";

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const plan = await callGemini(model, system, userText);
        return res.status(200).json(plan);
      } catch (e) {
        lastError = e.message;
        console.log(`${model} attempt ${attempt + 1} failed:`, e.message);
        // busy (503) or rate limit (429): wait a moment, retry, then next model
        if (e.status === 503 || e.status === 429) {
          await new Promise((ok) => setTimeout(ok, 1000));
        } else {
          break; // other errors: skip to the next model
        }
      }
    }
  }

  res.status(500).json({ error: lastError });
}
