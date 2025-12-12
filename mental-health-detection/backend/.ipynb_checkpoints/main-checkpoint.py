from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random # We'll use this to fake the prediction

app = FastAPI()

# This is crucial for allowing your React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allows your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: PredictRequest):
    # --- FAKE MODEL PREDICTION ---
    # For the demo, we are not using a real model yet.
    # We will just return a random prediction.
    print(f"Received text: {req.text}")
    prediction = random.choice([0, 1]) # Randomly returns 0 or 1
    return {"label": prediction}