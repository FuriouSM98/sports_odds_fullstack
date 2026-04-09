import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import MatchCard from '../components/MatchCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites').then(({ data }) => {
      setFavorites(data);
      setLoading(false);
    });
  }, []);

  const toggleFavorite = id => {
    setFavorites(prev => prev.filter(m => m.match_id !== id));
  };

  return (
    <div className="page">
      <header>
        <h1>Favorites</h1>
        <nav><Link to="/">Back to Matches</Link></nav>
      </header>
      {loading ? <p className="loading">Loading...</p> : favorites.length === 0 ? (
        <p className="empty">No favorites yet.</p>
      ) : (
        <div className="matches-grid">
          {favorites.map(m => (
            <MatchCard key={m.match_id} match={m} isFavorite={true} onFavoriteToggle={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}