import api from '../api/client';

export default function MatchCard({ match, onFavoriteToggle, isFavorite }) {
  const handleFavorite = async () => {
    if (isFavorite) {
      await api.delete(`/favorites/${match.match_id}`);
    } else {
      await api.post('/favorites', { match_id: match.match_id });
    }
    onFavoriteToggle(match.match_id);
  };

  const topProb = Math.max(match.probabilities.teamA, match.probabilities.teamB);
  const favorite = match.probabilities.teamA >= match.probabilities.teamB ? match.team_a : match.team_b;

  return (
    <div className="match-card">
      <div className="match-header">
        <span className="league">{match.sport} · {match.league}</span>
        <button className={`fav-btn ${isFavorite ? 'active' : ''}`} onClick={handleFavorite}>
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <h3 className="teams">{match.teams}</h3>
      <p className="start-time">{new Date(match.start_time).toLocaleString()}</p>

      <div className="odds-row">
        <div className="odd-box">
          <span className="odd-label">{match.team_a}</span>
          <span className="odd-value">{match.odds.teamA}</span>
          <div className="prob-bar">
            <div style={{ width: `${(match.probabilities.teamA * 100).toFixed(0)}%` }} />
          </div>
          <span className="prob-text">{(match.probabilities.teamA * 100).toFixed(1)}%</span>
        </div>

        <div className="odd-box draw">
          <span className="odd-label">Draw</span>
          <span className="odd-value">{match.odds.draw}</span>
          <div className="prob-bar">
            <div style={{ width: `${(match.probabilities.draw * 100).toFixed(0)}%` }} />
          </div>
          <span className="prob-text">{(match.probabilities.draw * 100).toFixed(1)}%</span>
        </div>

        <div className="odd-box">
          <span className="odd-label">{match.team_b}</span>
          <span className="odd-value">{match.odds.teamB}</span>
          <div className="prob-bar">
            <div style={{ width: `${(match.probabilities.teamB * 100).toFixed(0)}%` }} />
          </div>
          <span className="prob-text">{(match.probabilities.teamB * 100).toFixed(1)}%</span>
        </div>
      </div>

      <p className="prediction">Predicted winner: <strong>{favorite}</strong> ({(topProb * 100).toFixed(1)}%)</p>
    </div>
  );
}