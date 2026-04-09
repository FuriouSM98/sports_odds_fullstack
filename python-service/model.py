def compute_h2h_factor(team_a: str, team_b: str, past_matches: list) -> dict:
    relevant = [
        m for m in past_matches
        if (m['team_a'] == team_a and m['team_b'] == team_b) or
           (m['team_a'] == team_b and m['team_b'] == team_a)
    ]

    if not relevant:
        return {"a_wins": 0, "b_wins": 0, "draws": 0, "total": 0}

    a_wins = sum(1 for m in relevant if m['winner'] == team_a)
    b_wins = sum(1 for m in relevant if m['winner'] == team_b)
    draws = sum(1 for m in relevant if m['winner'] == 'draw')

    return {"a_wins": a_wins, "b_wins": b_wins, "draws": draws, "total": len(relevant)}


def generate_odds(team_a: str, team_b: str, team_a_rating: int, team_b_rating: int, past_matches: list = []) -> dict:
    total_rating = team_a_rating + team_b_rating

    # base probability from ratings (scaled to 85% - leaving 15% for draw)
    base_a = (team_a_rating / total_rating) * 0.85
    base_b = (team_b_rating / total_rating) * 0.85

    h2h = compute_h2h_factor(team_a, team_b, past_matches)

    if h2h["total"] > 0:
        # h2h win rates
        h2h_a = h2h["a_wins"] / h2h["total"]
        h2h_b = h2h["b_wins"] / h2h["total"]
        h2h_draw = h2h["draws"] / h2h["total"]

        # blend: 60% ratings, 40% h2h
        blended_a = (base_a * 0.6) + (h2h_a * 0.85 * 0.4)
        blended_b = (base_b * 0.6) + (h2h_b * 0.85 * 0.4)
        draw_boost = h2h_draw * 0.4
    else:
        blended_a = base_a
        blended_b = base_b
        draw_boost = 0

    raw_draw = max(0.10, 1 - blended_a - blended_b + draw_boost)

    # normalize so everything sums to 1
    total = blended_a + blended_b + raw_draw
    prob_a = round(blended_a / total, 4)
    prob_b = round(blended_b / total, 4)
    prob_draw = round(1 - prob_a - prob_b, 4)

    def to_odds(p):
        return round(1 / p, 2) if p > 0.01 else 99.0

    return {
        "teamA_win_prob": prob_a,
        "teamB_win_prob": prob_b,
        "draw_prob": prob_draw,
        "h2h": h2h,
        "odds": {
            "teamA": to_odds(prob_a),
            "teamB": to_odds(prob_b),
            "draw": to_odds(prob_draw),
        }
    }