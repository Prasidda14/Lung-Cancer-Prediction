from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rf_model = joblib.load('models/random_forest_model.pkl')
xgb_model = joblib.load('models/xgb_model.pkl')


class PatientData(BaseModel):
    yellow_fingers: int
    anxiety: int
    peer_pressure: int
    chronic_disease: int
    fatigue: int
    allergy: int
    wheezing: int
    alcohol_consuming: int
    coughing: int
    swallowing_difficulty: int
    chest_pain: int


@app.get("/")
def home():
    return {"message": "Lung Cancer Prediction API"}



@app.post("/predict")
def predict(data: PatientData):

    features = np.array([[
        data.yellow_fingers,
        data.anxiety,
        data.peer_pressure,
        data.chronic_disease,
        data.fatigue,
        data.allergy,
        data.wheezing,
        data.alcohol_consuming,
        data.coughing,
        data.swallowing_difficulty,
        data.chest_pain,
        data.anxiety * data.yellow_fingers
    ]])

    rf_prediction = int(rf_model.predict(features)[0])
    xgb_prediction = int(xgb_model.predict(features)[0])
    rf_probability = float(rf_model.predict_proba(features)[0][1])
    xgb_probability = float(xgb_model.predict_proba(features)[0][1])


    return {
        'random_forest_prediction': rf_prediction,
        'random_forest_probability': rf_probability,
        'xboost_prediction': xgb_prediction,
        'xboost_probability': xgb_probability
    }
