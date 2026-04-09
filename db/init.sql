CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  sport VARCHAR(100) NOT NULL,
  league VARCHAR(100) NOT NULL,
  team_a VARCHAR(100) NOT NULL,
  team_b VARCHAR(100) NOT NULL,
  team_a_rating INT DEFAULT 70,
  team_b_rating INT DEFAULT 70,
  start_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE odds_cache (
  match_id INT PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  team_a_win FLOAT NOT NULL,
  team_b_win FLOAT NOT NULL,
  draw FLOAT NOT NULL,
  team_a_prob FLOAT NOT NULL,
  team_b_prob FLOAT NOT NULL,
  draw_prob FLOAT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE past_matches (
  id SERIAL PRIMARY KEY,
  sport VARCHAR(100) NOT NULL,
  league VARCHAR(100) NOT NULL,
  team_a VARCHAR(100) NOT NULL,
  team_b VARCHAR(100) NOT NULL,
  score_a INT NOT NULL,
  score_b INT NOT NULL,
  winner VARCHAR(100),
  played_at TIMESTAMPTZ NOT NULL
);

INSERT INTO matches (sport, league, team_a, team_b, team_a_rating, team_b_rating, start_time) VALUES
('Football', 'Premier League', 'Arsenal', 'Chelsea', 82, 78, NOW() + INTERVAL '2 hours'),
('Football', 'La Liga', 'Barcelona', 'Real Madrid', 88, 90, NOW() + INTERVAL '5 hours'),
('Basketball', 'NBA', 'Lakers', 'Warriors', 75, 80, NOW() + INTERVAL '8 hours'),
('Football', 'Serie A', 'Juventus', 'AC Milan', 76, 74, NOW() + INTERVAL '24 hours'),
('Football', 'Bundesliga', 'Bayern Munich', 'Dortmund', 91, 83, NOW() + INTERVAL '48 hours'),
('Football', 'Premier League', 'Liverpool', 'Manchester City', 85, 88, NOW() + INTERVAL '3 hours'),
('Football', 'La Liga', 'Atletico Madrid', 'Sevilla', 80, 72, NOW() + INTERVAL '6 hours'),
('Basketball', 'NBA', 'Celtics', 'Heat', 83, 77, NOW() + INTERVAL '30 hours'),
('Football', 'Ligue 1', 'PSG', 'Lyon', 89, 74, NOW() + INTERVAL '36 hours'),
('Football', 'Premier League', 'Manchester United', 'Tottenham', 73, 76, NOW() + INTERVAL '54 hours'),
('Basketball', 'NBA', 'Nuggets', 'Suns', 81, 78, NOW() + INTERVAL '72 hours'),
('Football', 'Serie A', 'Inter Milan', 'Napoli', 84, 82, NOW() + INTERVAL '96 hours');

INSERT INTO past_matches (sport, league, team_a, team_b, score_a, score_b, winner, played_at) VALUES
('Football', 'Premier League', 'Arsenal', 'Chelsea', 3, 1, 'Arsenal', NOW() - INTERVAL '7 days'),
('Football', 'Premier League', 'Chelsea', 'Arsenal', 0, 2, 'Arsenal', NOW() - INTERVAL '60 days'),
('Football', 'Premier League', 'Arsenal', 'Chelsea', 1, 1, 'draw', NOW() - INTERVAL '120 days'),
('Football', 'Premier League', 'Chelsea', 'Arsenal', 2, 0, 'Chelsea', NOW() - INTERVAL '180 days'),
('Football', 'Premier League', 'Arsenal', 'Chelsea', 2, 1, 'Arsenal', NOW() - INTERVAL '240 days'),
('Football', 'La Liga', 'Barcelona', 'Real Madrid', 1, 3, 'Real Madrid', NOW() - INTERVAL '10 days'),
('Football', 'La Liga', 'Real Madrid', 'Barcelona', 2, 2, 'draw', NOW() - INTERVAL '70 days'),
('Football', 'La Liga', 'Barcelona', 'Real Madrid', 4, 0, 'Barcelona', NOW() - INTERVAL '130 days'),
('Football', 'La Liga', 'Real Madrid', 'Barcelona', 1, 0, 'Real Madrid', NOW() - INTERVAL '200 days'),
('Football', 'La Liga', 'Barcelona', 'Real Madrid', 2, 1, 'Barcelona', NOW() - INTERVAL '260 days'),
('Basketball', 'NBA', 'Lakers', 'Warriors', 105, 112, 'Warriors', NOW() - INTERVAL '5 days'),
('Basketball', 'NBA', 'Warriors', 'Lakers', 120, 98, 'Warriors', NOW() - INTERVAL '40 days'),
('Basketball', 'NBA', 'Lakers', 'Warriors', 115, 110, 'Lakers', NOW() - INTERVAL '90 days'),
('Basketball', 'NBA', 'Warriors', 'Lakers', 108, 115, 'Lakers', NOW() - INTERVAL '150 days'),
('Basketball', 'NBA', 'Lakers', 'Warriors', 99, 103, 'Warriors', NOW() - INTERVAL '210 days'),
('Football', 'Serie A', 'Juventus', 'AC Milan', 2, 0, 'Juventus', NOW() - INTERVAL '14 days'),
('Football', 'Serie A', 'AC Milan', 'Juventus', 1, 1, 'draw', NOW() - INTERVAL '80 days'),
('Football', 'Serie A', 'Juventus', 'AC Milan', 3, 2, 'Juventus', NOW() - INTERVAL '140 days'),
('Football', 'Serie A', 'AC Milan', 'Juventus', 2, 1, 'AC Milan', NOW() - INTERVAL '200 days'),
('Football', 'Serie A', 'Juventus', 'AC Milan', 0, 0, 'draw', NOW() - INTERVAL '260 days'),
('Football', 'Bundesliga', 'Bayern Munich', 'Dortmund', 4, 2, 'Bayern Munich', NOW() - INTERVAL '8 days'),
('Football', 'Bundesliga', 'Dortmund', 'Bayern Munich', 1, 3, 'Bayern Munich', NOW() - INTERVAL '75 days'),
('Football', 'Bundesliga', 'Bayern Munich', 'Dortmund', 2, 2, 'draw', NOW() - INTERVAL '135 days'),
('Football', 'Bundesliga', 'Dortmund', 'Bayern Munich', 1, 0, 'Dortmund', NOW() - INTERVAL '195 days'),
('Football', 'Bundesliga', 'Bayern Munich', 'Dortmund', 5, 1, 'Bayern Munich', NOW() - INTERVAL '255 days');