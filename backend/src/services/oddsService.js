const axios = require('axios');
const db = require('../config/db');

const PYTHON_URL = process.env.PYTHON_SERVICE_URL;

async function fetchPastMatches(teamA, teamB) {
  const { rows } = await db.query(
    `SELECT team_a, team_b, winner FROM past_matches
     WHERE (team_a = $1 AND team_b = $2) OR (team_a = $2 AND team_b = $1)
     ORDER BY played_at DESC LIMIT 10`,
    [teamA, teamB]
  );
  return rows;
}

async function getOddsForMatches(matches) {
  const enriched = await Promise.all(
    matches.map(async m => ({
      teamA: m.team_a,
      teamB: m.team_b,
      teamA_rating: m.team_a_rating,
      teamB_rating: m.team_b_rating,
      past_matches: await fetchPastMatches(m.team_a, m.team_b),
    }))
  );

  const { data } = await axios.post(`${PYTHON_URL}/generate-odds/batch`, { matches: enriched }, {timeout: 30000});
  return data;
}

module.exports = { getOddsForMatches };