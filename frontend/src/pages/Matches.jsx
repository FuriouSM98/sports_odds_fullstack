import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import MatchCard from '../components/MatchCard';
import AgentChat from '../components/AgentChat';
import MatchFilters from '../components/MatchFilters';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ sport: 'All', league: 'All' });
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    const fetchWithRetry = async (retries = 6) => {
      try {
        const [m, f] = await Promise.all([api.get('/matches'), api.get('/favorites')]);
        setMatches(m.data);
        setFiltered(m.data);
        setFavorites(new Set(f.data.map(x => x.match_id)));
        setLoading(false);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => fetchWithRetry(retries - 1), 10000);
        } else {
          setLoading(false);
        }
      }
    };

    fetchWithRetry();
  }, []);

  const handleFilter = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);

    setFiltered(matches.filter(m => {
      const sportMatch = updated.sport === 'All' || m.sport === updated.sport;
      const leagueMatch = updated.league === 'All' || m.league === updated.league;
      return sportMatch && leagueMatch;
    }));
  };

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

      <MatchFilters matches={matches} onFilter={handleFilter} />

      {loading ? (
        <p className="loading">Generating odds... (waking up services, retrying if needed)</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No matches found.</p>
      ) : (
        <div className="matches-grid">
          {filtered.map(m => (
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