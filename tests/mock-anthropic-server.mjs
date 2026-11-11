// A fake Anthropic Messages API used ONLY for automated tests.
// It streams responses in the same Server-Sent Events format as the real API,
// so the app's real server code (SDK, structured outputs, error handling) is exercised.
//
// Special words in the user's input trigger error scenarios:
//   SIMULATE_RATE_LIMIT -> HTTP 429
//   SIMULATE_REFUSAL    -> stop_reason "refusal"
//
// GET /__requests returns every request body received (to check what we send to the AI).

import http from "node:http";

const PORT = Number(process.env.MOCK_PORT || 4010);
const requests = [];

function resumeFixture() {
  return {
    headline: "Aspiring Virtual Assistant | Customer Support",
    summary:
      "Customer service professional with 3 years of BPO experience handling high-volume inquiries. Skilled in clear communication and accurate record keeping.",
    skills: [
      { category: "Customer Service", items: ["Email support", "Handling complaints"] },
      { category: "Tools & Software", items: ["Google Sheets", "Canva"] },
    ],
    experience: [
      {
        role: "Customer Service Representative",
        organization: "BPO / Telecommunications",
        duration: "2021 – 2024 (3 years)",
        bullets: ["Resolved customer billing inquiries by phone and email", "Updated customer records accurately"],
      },
    ],
    education: ["BS Business Administration, University of San Carlos, 2020"],
    certifications: [],
    transferableSkills: ["Clear written communication", "Time management"],
    missingInfo: ["How many customers did you typically assist per day?"],
  };
}

function sectionsFixture(prompt) {
  const titles = [...prompt.matchAll(/^\d+\.\s+"([^"]+)"/gm)].map((m) => m[1]);
  return {
    sections: titles.map((t) => ({ title: t, content: `Sample ${t} content.\n- Line two for ${t}` })),
    missingInfo: ["Have you used Shopify before?"],
  };
}

function sse(res, events) {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
  for (const [event, data] of events) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  res.end();
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/__requests") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(requests));
  }
  if (req.method !== "POST" || !req.url.startsWith("/v1/messages")) {
    res.writeHead(404);
    return res.end();
  }
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const body = JSON.parse(raw);
    requests.push({ headers: { authorization: req.headers["authorization"] ?? req.headers["x-api-key"], "anthropic-beta": req.headers["anthropic-beta"] }, body });
    const prompt = body.messages?.[0]?.content ?? "";

    if (prompt.includes("SIMULATE_RATE_LIMIT")) {
      res.writeHead(429, { "content-type": "application/json", "retry-after-ms": "5" });
      return res.end(JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "rate limited" } }));
    }

    const task = /<task>(\w+)<\/task>/.exec(prompt)?.[1];
    const refusal = prompt.includes("SIMULATE_REFUSAL");
    const json = refusal ? "" : JSON.stringify(task === "resume" ? resumeFixture() : sectionsFixture(prompt));
    const chunks = json.match(/[\s\S]{1,40}/g) ?? [];

    sse(res, [
      ["message_start", { type: "message_start", message: { id: "msg_test", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 100, output_tokens: 1 } } }],
      ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
      ...chunks.map((text) => ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } }]),
      ["content_block_stop", { type: "content_block_stop", index: 0 }],
      ["message_delta", { type: "message_delta", delta: { stop_reason: refusal ? "refusal" : "end_turn", stop_sequence: null }, usage: { output_tokens: 200 } }],
      ["message_stop", { type: "message_stop" }],
    ]);
  });
});

server.listen(PORT, "127.0.0.1", () => console.log(`mock anthropic listening on ${PORT}`));
