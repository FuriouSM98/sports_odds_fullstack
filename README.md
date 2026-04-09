# Sports Odds Intelligence Platform

A full-stack sports odds platform where matches are displayed with dynamically generated odds powered by a Python AI model, an intelligent agent for match analysis, and a React frontend for a clean user experience.

---

## System Architecture
[React Frontend] ←→ [Node.js API] ←→ [PostgreSQL]
↓
[Python AI Service]

The pipeline follows: **Data → Model → API → UI**

- **Node.js (Express)** — core API, handles auth, matches, favorites, and orchestrates calls to the Python service
- **Python (FastAPI)** — generates odds dynamically using a rating + head-to-head probability model
- **PostgreSQL** — stores users, matches, past match history, odds cache, and favorites
- **React (Vite)** — displays matches, odds, probability bars, favorites, and the AI agent chat
- **Docker** — all four services containerized and orchestrated with docker-compose

---

## Features

### Authentication
- User registration and login via email and password
- Passwords are hashed with bcrypt
- JWT-based authentication with a 7-day expiry
- All match, favorite, and agent routes are protected and require a valid token

### Matches
Matches are stored in the database without odds. When a user requests matches, the Node.js backend:
1. Fetches all upcoming matches from PostgreSQL
2. Checks the odds cache (valid for 1 hour)
3. For any uncached matches, fetches relevant head-to-head history from `past_matches`
4. Sends a **single batch request** to the Python service with all uncached matches
5. Stores the returned odds in the cache
6. Returns the full response with odds and probabilities attached

Each match response includes:
```json
{
  "match_id": 1,
  "sport": "Football",
  "league": "Premier League",
  "teams": "Arsenal vs Chelsea",
  "team_a": "Arsenal",
  "team_b": "Chelsea",
  "start_time": "2026-04-09T14:00:00.000Z",
  "odds": { "teamA": 1.95, "teamB": 3.10, "draw": 3.80 },
  "probabilities": { "teamA": "51.2%", "teamB": "32.2%", "draw": "15.0%" }
}
```

### AI-Generated Odds (Python Service)
Odds are never hardcoded. The Python FastAPI service exposes two endpoints:

- `POST /generate-odds` — single match
- `POST /generate-odds/batch` — multiple matches in one call

The model blends two signals:

**1. Rating-based probability (60% weight)**
- Win probability is derived from each team's rating relative to the total
- Scaled to 85% leaving 15% for draws

**2. Head-to-Head history (40% weight)**
- Win rates are calculated from past matches between the two teams
- Draw frequency from historical results boosts the draw probability

Final probabilities are normalized to sum to 1.0, then converted to decimal odds using `1 / probability`. Matches with no historical data fall back to pure rating-based odds.

### Odds Caching
Generated odds are stored in the `odds_cache` table with a timestamp. On subsequent requests within 1 hour, the cached odds are served directly — no Python call is made. After 1 hour, odds are recalculated automatically.

### Past Matches
A `past_matches` table stores historical results between teams. This data is used by the odds model to factor in head-to-head records and is also available to the AI agent for match analysis and reasoning.

### Favorites
- Authenticated users can save any match as a favorite
- Favorites are fetched with full odds and probabilities included
- Duplicate favorites are rejected with a 409 response
- Users can remove favorites at any time

### AI Agent
The agent is powered by **Gemini 2.5 Flash** (via Google AI Studio) with thinking disabled to minimize token usage.

On every query, the agent is given:
- All upcoming matches with their odds and probabilities
- Full head-to-head history grouped by matchup

The agent answers strictly from this context — no external knowledge or RAG. It handles open-ended natural language questions such as:

- "Who is likely to win?"
- "Give me matches with close odds"
- "Which match is most predictable?"
- "How has Arsenal performed against Chelsea historically?"
- "What are the odds for PSG vs Lyon?"

Endpoint: `POST /agent/query` with body `{ "query": "your question here" }`

### Frontend
Built with React + Vite, using Zustand for auth state and React Router for navigation.

**Matches Page**
- Cards for every upcoming match showing teams, league, sport, and start time
- AI-generated odds displayed prominently for Team A, Draw, and Team B
- Visual probability bars showing each outcome's likelihood
- Predicted winner highlighted in green with their win percentage
- Loading state shown while odds are being fetched
- Star button to add or remove a match from favorites
- Filter matches by sport using the Sport dropdown
- Filter matches by league using the League dropdown
- Both filters work together — selecting Football + Premier League shows only those matches
- Dropdowns auto-populate from available matches, no hardcoding

**Favorites Page**
- Shows all saved matches with full odds and probability bars
- Removing a favorite updates the list instantly

**AI Agent Chat**
- Embedded in the matches page
- Quick suggestion buttons for common queries
- Free-text input supporting any relevant question
- Responses reference actual odds and h2h data from the database

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login, returns JWT |
| GET | /matches | Yes | All matches with AI-generated odds |
| POST | /favorites | Yes | Save a match as favorite |
| GET | /favorites | Yes | Get all favorites with odds |
| DELETE | /favorites/:match_id | Yes | Remove a favorite |
| POST | /agent/query | Yes | Ask the AI agent a question |
| POST | /generate-odds | Internal | Single match odds (Python) |
| POST | /generate-odds/batch | Internal | Batch match odds (Python) |

---

## Bonus Features Implemented

- Odds caching with 1-hour TTL
- Batch API calls to Python (single request for all uncached matches)
- Visual probability bars in the UI
- Feature-based model combining team ratings and head-to-head history
- Docker setup with docker-compose

---

## Running Locally with Docker

1. Clone the repo
2. Copy the example env files and fill in your keys:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

3. Required keys:
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com)
   - `JWT_SECRET` — generate with:
```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Start all services:
```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Python Service: http://localhost:8000

---

## Running Locally Without Docker

**PostgreSQL** — create a database named `sports_odds` and run `db/init.sql`

**Python Service**
```bash
cd python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

**Node.js Backend**
```bash
cd backend
npm install
npm run dev
```

**React Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend available at http://localhost:5173

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Zustand, React Router |
| Backend | Node.js, Express, JWT, bcrypt |
| AI Service | Python, FastAPI, rating + h2h model |
| AI Agent | Gemini 2.5 Flash (Google AI Studio) |
| Database | PostgreSQL |
| Containerization | Docker, docker-compose |