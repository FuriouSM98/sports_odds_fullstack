export default function MatchFilters({ matches, onFilter }) {
  const sports = ['All', ...new Set(matches.map(m => m.sport))];
  const leagues = ['All', ...new Set(matches.map(m => m.league))];

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilter(name, value);
  };

  return (
    <div className="filters">
      <select name="sport" onChange={handleChange}>
        {sports.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select name="league" onChange={handleChange}>
        {leagues.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
    </div>
  );
}