const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { getOddsForMatches } = require('../services/oddsService');

router.get('/', auth, async (req, res) => {
  try {
    const { rows: matches } = await db.query('SELECT * FROM matches ORDER BY start_time ASC');

    const cached = await db.query('SELECT * FROM odds_cache');
    const cacheMap = Object.fromEntries(cached.rows.map(r => [r.match_id, r]));

    const uncached = matches.filter(m => {
      const c = cacheMap[m.id];
      if (!c) return true;
      const age = (Date.now() - new Date(c.generated_at)) / 1000 / 60;
      return age > 60;
    });

    if (uncached.length > 0) {
      const results = await getOddsForMatches(uncached);
      for (let i = 0; i < uncached.length; i++) {
        const m = uncached[i];
        const o = results[i];
        await db.query(`
          INSERT INTO odds_cache (match_id, team_a_win, team_b_win, draw, team_a_prob, team_b_prob, draw_prob, generated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
          ON CONFLICT (match_id) DO UPDATE SET
            team_a_win=$2, team_b_win=$3, draw=$4,
            team_a_prob=$5, team_b_prob=$6, draw_prob=$7, generated_at=NOW()
        `, [m.id, o.odds.teamA, o.odds.teamB, o.odds.draw, o.teamA_win_prob, o.teamB_win_prob, o.draw_prob]);
        cacheMap[m.id] = { team_a_win: o.odds.teamA, team_b_win: o.odds.teamB, draw: o.odds.draw, team_a_prob: o.teamA_win_prob, team_b_prob: o.teamB_win_prob, draw_prob: o.draw_prob };
      }
    }

    const response = matches.map(m => {
      const o = cacheMap[m.id];
      return {
        match_id: m.id,
        sport: m.sport,
        league: m.league,
        teams: `${m.team_a} vs ${m.team_b}`,
        team_a: m.team_a,
        team_b: m.team_b,
        start_time: m.start_time,
        odds: { teamA: o.team_a_win, teamB: o.team_b_win, draw: o.draw },
        probabilities: { teamA: o.team_a_prob, teamB: o.team_b_prob, draw: o.draw_prob },
      };
    });

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

module.exports = router;