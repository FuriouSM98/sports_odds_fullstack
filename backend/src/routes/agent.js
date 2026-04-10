const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const axios = require('axios');

async function buildContext() {
  const { rows: matches } = await db.query(`
    SELECT m.*, o.team_a_win, o.team_b_win, o.draw,
          o.team_a_prob, o.team_b_prob, o.draw_prob
    FROM matches m
    INNER JOIN odds_cache o ON o.match_id = m.id
    ORDER BY m.start_time ASC
  `);

  const { rows: past } = await db.query(`
    SELECT * FROM past_matches ORDER BY played_at DESC
  `);

  const matchSummaries = matches.map(m => ({
    id: m.id,
    match: `${m.team_a} vs ${m.team_b}`,
    sport: m.sport,
    league: m.league,
    start_time: new Date(m.start_time).toLocaleString(),
    team_a_rating: m.team_a_rating,
    team_b_rating: m.team_b_rating,
    odds: m.team_a_win ? {
      [m.team_a]: m.team_a_win,
      [m.team_b]: m.team_b_win,
      draw: m.draw,
    } : null,
    probabilities: m.team_a_prob ? {
      [m.team_a]: `${(m.team_a_prob * 100).toFixed(1)}%`,
      [m.team_b]: `${(m.team_b_prob * 100).toFixed(1)}%`,
      draw: `${(m.draw_prob * 100).toFixed(1)}%`,
    } : null,
  }));

  const h2hMap = {};
  for (const p of past) {
    const key = [p.team_a, p.team_b].sort().join(' vs ');
    if (!h2hMap[key]) h2hMap[key] = { results: [] };
    h2hMap[key].results.push({
      match: `${p.team_a} ${p.score_a} - ${p.score_b} ${p.team_b}`,
      winner: p.winner,
      date: new Date(p.played_at).toLocaleDateString(),
    });
  }

  return { matchSummaries, h2hMap };
}

router.post('/query', auth, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    const { matchSummaries, h2hMap } = await buildContext();

    const prompt = `You are a sports odds analyst AI. Answer only using the data provided below. Do not use any outside knowledge.

Upcoming Matches:
${JSON.stringify(matchSummaries, null, 2)}

Head-to-Head History:
${JSON.stringify(h2hMap, null, 2)}

Rules:
- Answer in clean plain text, no markdown symbols like **, *, or #
- Use line breaks to separate matches or sections
- Reference specific odds, probabilities, and h2h records when relevant
- If asked about a specific team or match, focus your answer on that
- If odds are unavailable for a match, mention it
- Do not use any knowledge outside the data provided above
- Keep answers under 50 words unless a detailed breakdown is requested
- Format multi-match answers like:
  Match: Team A vs Team B
  Favorite: Team Name (XX.X%)
  Odds: X.XX

Question: ${query}`;

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 }, },
      }
    );

    const answer = data.candidates[0].content.parts[0].text;
    res.json({ answer });
  } catch (err) {
    const status = err.response?.status;
    if (status === 429) {
      return res.status(429).json({ error: 'Agent is rate limited, please wait a moment and try again.' });
    }
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Agent error' });
  }
});

module.exports = router;