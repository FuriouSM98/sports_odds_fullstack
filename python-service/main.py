from fastapi import FastAPI
from pydantic import BaseModel
from model import generate_odds

app = FastAPI()

class PastMatch(BaseModel):
    team_a: str
    team_b: str
    winner: str

class MatchInput(BaseModel):
    teamA: str
    teamB: str
    teamA_rating: int = 70
    teamB_rating: int = 70
    past_matches: list[PastMatch] = []

class BatchMatchInput(BaseModel):
    teamA: str
    teamB: str
    teamA_rating: int = 70
    teamB_rating: int = 70
    past_matches: list[PastMatch] = []

class BatchInput(BaseModel):
    matches: list[BatchMatchInput]

@app.post("/generate-odds")
def single_odds(data: MatchInput):
    return generate_odds(
        data.teamA, data.teamB,
        data.teamA_rating, data.teamB_rating,
        [m.dict() for m in data.past_matches]
    )

@app.post("/generate-odds/batch")
def batch_odds(data: BatchInput):
    return [
        {"index": i, **generate_odds(
            m.teamA, m.teamB,
            m.teamA_rating, m.teamB_rating,
            [p.dict() for p in m.past_matches]
        )}
        for i, m in enumerate(data.matches)
    ]