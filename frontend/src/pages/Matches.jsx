import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import MatchCard from '../components/MatchCard';
import AgentChat from '../components/AgentChat';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    Promise.all([api.get('/matches'), api.get('/favorites')]).then(([m, f]) => {
      setMatches(m.data);
      setFavorites(new Set(f.data.map(x => x.match_id)));
      setLoading(false);
    });
  }, []);

  const toggleFavorite = id => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="page">
      <header>
        <h1>Sports Odds</h1>
        <nav>
          <Link to="/favorites">Favorites</Link>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <AgentChat />

      {loading ? (
        <p className="loading">Generating odds...</p>
      ) : (
        <div className="matches-grid">
          {matches.map(m => (
            <MatchCard
              key={m.match_id}
              match={m}
              isFavorite={favorites.has(m.match_id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}