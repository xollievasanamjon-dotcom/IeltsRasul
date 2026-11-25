export const CLICHE_RULES = [
  { regex: /\bnowadays\b/gi, bad: 'nowadays', fix: 'in recent decades / increasingly' },
  { regex: /\bfirstly\b/gi, bad: 'firstly', fix: 'связывай по смыслу без нумерации (e.g. A primary driver is...)' },
  { regex: /\bsecondly\b/gi, bad: 'secondly', fix: 'Beyond this / Equally important' },
  { regex: /\bmoreover\b/gi, bad: 'moreover', fix: 'Furthermore / This is compounded by' },
  { regex: /\bin conclusion\b/gi, bad: 'in conclusion', fix: 'Ultimately / Overall' },
  { regex: /\bin my humble opinion\b/gi, bad: 'in my humble opinion', fix: 'I firmly believe / Honestly (Speaking)' },
  { regex: /\bvery bad\b/gi, bad: 'very bad', fix: 'genuinely detrimental / deeply harmful' },
  { regex: /\bvery good\b/gi, bad: 'very good', fix: 'remarkably effective / highly beneficial' },
  { regex: /\bbig problem\b/gi, bad: 'big problem', fix: 'pressing challenge / acute issue' },
  { regex: /\ba lot of\b/gi, bad: 'a lot of', fix: 'a substantial share of / numerous' }
];

export function analyzeEssayLocally(text, taskMode = 'task2') {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const paragraphs = clean ? clean.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
  const minWords = taskMode === 'task1' ? 150 : 250;

  const clichésFound = [];
  CLICHE_RULES.forEach(rule => {
    if (rule.regex.test(clean)) {
      clichésFound.push({ bad: rule.bad, fix: rule.fix });
    }
  });

  const hasNounClause = /what\s+\w+.*is\s+that|whether\s+\w+/i.test(clean);
  const hasInversion = /not only\s+(does|do|did|can|will|have)|rarely\s+have/i.test(clean);
  const hasConcession = /\b(while|although|admittedly|granted|whereas)\b/i.test(clean);
  const hasOverview = /\boverall\b/i.test(clean);

  return {
    words,
    minWords,
    paragraphs,
    clichésFound,
    hasNounClause,
    hasInversion,
    hasConcession,
    hasOverview
  };
}

export function playTimerChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch (e) {}
}

export async function gradeWithGemini({ apiKey, text, mode, prompt }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('NO_KEY');
  }

  const systemInstruction =
    mode === 'speaking'
      ? `You are a strict, realistic IELTS Speaking Examiner. Evaluate the candidate's spoken answer in Russian (keeping English examples natural US/UK Band 8.0+ without robotic essay linkers). Return concise Markdown with:
1) Estimated Band (FC, LR, GRA, Overall)
2) 3 concrete weaknesses
3) A natural, non-robotic Band 8.0 rewrite of the candidate's exact ideas.`
      : `You are a strict, official IELTS Academic Writing Examiner. Evaluate the candidate's ${mode === 'task1' ? 'Task 1' : 'Task 2'} response in Russian (with English rewrites). Return structured Markdown with:
1) Band Scores: TR/TA, CC, LR, GRA, Overall (realistic, no inflation)
2) Top 3 specific score-killers in their text
3) Exact upgraded rewrites of 2–3 of their weakest sentences into natural Band 8.0 English (using Noun Clauses, Inversion, or Concession where natural).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nPrompt: ${prompt || 'General IELTS Academic task'}\n\nCandidate response:\n${text}`
            }
          ]
        }
      ],
      generationConfig: { temperature: 0.4 }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 140)}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('Пустой ответ от Gemini API');
  return reply;
}
