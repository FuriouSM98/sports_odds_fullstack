import { useState } from 'react';
import api from '../api/client';

const SUGGESTIONS = [
  'Who is likely to win?',
  'Give me matches with close odds',
  'Which match is most predictable?',
];

export default function AgentChat() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const { data } = await api.post('/agent/query', { query: text });
      setAnswer(data.answer);
    } catch (err) {
      if (err.response?.status === 429) {
        setAnswer('Rate limited — please wait a moment and try again.');
      } else {
        setAnswer('Agent unavailable.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="agent-chat">
      <h3>AI Agent</h3>
      <div className="suggestions">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => ask(s)}>{s}</button>
        ))}
      </div>
      <div className="agent-input">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask about matches..."
        />
        <button onClick={() => ask()}>Ask</button>
      </div>
      {loading && <p className="agent-answer">Thinking...</p>}
      {answer && <p className="agent-answer">{answer}</p>}
    </div>
  );
}