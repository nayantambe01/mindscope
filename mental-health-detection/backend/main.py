from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import os
import re

app = FastAPI()

# 1. Add this "Home" route so you don't see 404
@app.get("/")
def home():
    return {"message": "MindScope Backend is Running!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
try:
    MODEL_PATH = "nayanhello/mindscope-deberta"
    print("Loading DistilBERT model...")
    classifier = pipeline("sentiment-analysis", model=MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    classifier = None


HIGH_SEVERITY_KEYWORDS = { "suicide": 2, "kill myself": 2, "end my life": 2, "want to die": 2, "k.m.s": 2, "planning to die": 2 }
MEDIUM_SEVERITY_KEYWORDS = {
    "hopeless": 1, "can't go on": 1, "no reason to live": 1, "better off without me": 1, "disappear forever": 1,
    "disappeared": 1, "end it all": 1, "empty and alone": 1, "tired of everything": 1, "tired of fighting": 1,
    "can't fight it anymore": 1, "go to sleep and not wake up": 1, "i am lost": 1, "huge fight": 1, "heartbroken": 1,
    "breakup": 1, "drained of energy": 1, "anxiety": 1, "overwhelmed": 1, "can't stop crying": 1,
    "frustrated with myself": 1, "let down": 1, "really lonely": 1, "isolating myself": 1, "dark thoughts": 1,
    "scolded": 1, "pressure on me": 1, "feeling down": 1, "crying on the inside": 1, "darkness is closing in": 1, "hurting": 1,
    "nothing seems to be going right": 1, "final day of my life": 1, "i can't take this pain": 1, "i give up": 1, "i'm done": 1, "last day of my life": 1
}
SHORT_PLEA_KEYWORDS = {"help me": 2, "i need help": 2}
TRIVIAL_CONTEXT_KEYWORDS = [ "my internet", "the movie", "this game", "my phone", "the weather", "traffic", "so funny", "lol", "lmao", "💀", "my exam", "the test", "school", "assignments", "the project", "this song" ]
BENIGN_PHRASES = ["i'm fine", "i am fine", "im fine", "it's fine", "its fine", "i'm ok", "i am ok", "im ok", "i will be okay"]
POSITIVE_KEYWORDS = ["enjoying", "happy", "great day", "love my", "excited for", "wonderful", "feeling positive", "feeling good"]
NEGATION_WORDS = ["not", "never", "no", "nothing", "don't", "isn't", "aren't"]

def clean_text_for_rules(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()


def get_final_result(text: str, model_output: dict, emotion: Optional[str]):
    cleaned_text = clean_text_for_rules(text)
    words = cleaned_text.split()
    
    
    for kw in POSITIVE_KEYWORDS:
        if kw in cleaned_text:
            is_negated = False
            try:
                kw_index = words.index(kw.split()[0])
                for i in range(max(0, kw_index - 3), kw_index):
                    if words[i] in NEGATION_WORDS: is_negated = True; break
            except ValueError: continue
            if not is_negated: return {"level": 0, "title": "No Immediate Risk Identified", "description": "The analysis detected positive sentiment."}
    if any(phrase in cleaned_text for phrase in BENIGN_PHRASES):
        return {"level": 0, "title": "No Immediate Risk Identified", "description": "The analysis did not detect high-risk patterns."}

    
    found_keywords = []
    highest_level = 0
    all_risk_keywords = {**SHORT_PLEA_KEYWORDS, **HIGH_SEVERITY_KEYWORDS, **MEDIUM_SEVERITY_KEYWORDS}
    for keyword, level in all_risk_keywords.items():
        if keyword in cleaned_text:
            found_keywords.append(keyword)
            highest_level = max(highest_level, level)
    if highest_level > 0:
        if highest_level == 2: return {"level": 2, "title": "High Potential Risk Identified", "description": "The language contains explicit high-risk keywords.", "explanation_keywords": list(set(found_keywords))}
        else: return {"level": 1, "title": "Signs of Distress Detected", "description": "The language contains patterns often associated with mental distress.", "explanation_keywords": list(set(found_keywords))}

    
    model_prediction = int(model_output['label'].split('_')[1])
    negative_emotions = ['sad', 'angry', 'fear', 'disgust']
    
    
    if model_prediction == 1 or (emotion and emotion in negative_emotions):
        if any(kw in cleaned_text for kw in TRIVIAL_CONTEXT_KEYWORDS):
            return {"level": 0, "title": "No Immediate Risk Identified", "description": "While negative sentiment was detected, the context appears non-critical."}
        
        
        description = "Our AI detected subtle patterns that may indicate distress."
        if emotion and emotion in negative_emotions and model_prediction == 0:
            description = f"A facial expression of '{emotion}' was detected, which, combined with the text, may indicate distress."

        return {"level": 1, "title": "Signs of Distress Detected", "description": description}

    
    return {"level": 0, "title": "No Immediate Risk Identified", "description": "The analysis did not detect high-risk patterns."}

class PredictRequest(BaseModel):
    text: str
    
    emotion: Optional[str] = None

@app.post("/predict")
def predict(req: PredictRequest):
    if classifier is None:
        return {"error": "Model not loaded."}
        
    model_results = classifier(req.text)[0]
    
    final_result = get_final_result(req.text, model_results, req.emotion)
    
    print(f"Text: '{req.text}', Emotion: {req.emotion} -> Final Result: {final_result['title']}")
    
    if "explanation_keywords" not in final_result:
        final_result["explanation_keywords"] = []
    return final_result

