# Lung Cancer Prediction Model

Full-stack machine learning web app that predicts lung cancer risk from clinical survey data using Decision Tree, Random Forest, and XGBoost models, with a FastAPI backend and React frontend — now with user authentication to keep predictions private per user.

## Overview

This project walks through the full ML pipeline — data preprocessing, 
exploratory data analysis (EDA), feature engineering, model training, and 
evaluation — to identify the most effective classification model for 
predicting lung cancer from patient survey responses. The trained models are 
served through a FastAPI backend and consumed by a React frontend, where 
registered users log in, answer an 11-question survey, and receive real-time 
predictions from the Random Forest and XGBoost models side-by-side.

## Authentication

- Users register with a username, full name, email, and password, and log in to receive a JWT access token.
- Passwords are hashed with PBKDF2-HMAC (SHA-256, 300,000 iterations) and a per-user random salt — no plaintext or reversible storage.
- JWT tokens (2-hour expiry) are issued on login/register and required as a Bearer token to call `/predict`, so predictions are only available to logged-in users.
- User records are stored in a local SQLite database (`backend/users.db`).

## Models Compared

| Model | Notes |
|---|---|
| Decision Tree | Simple baseline; interpretable (notebook only) |
| Random Forest | Ensemble method; strong baseline performance |
| XGBoost | Gradient boosting; evaluated against Random Forest |

Evaluation metrics: Classification report, confusion matrix, accuracy score. The deployed API currently serves predictions from Random Forest and XGBoost.

## Pipeline Steps

1. Data loading and inspection
2. Handling missing values and data types
3. Exploratory Data Analysis (EDA) with visualisations
4. Feature engineering and selection (incl. an Anxiety × Yellow Fingers interaction term)
5. Model training (Decision Tree vs Random Forest vs XGBoost)
6. Performance evaluation and comparison
7. Model export (joblib) for deployment
8. Serving via a FastAPI backend (with JWT-protected endpoints) and a React frontend for interactive, authenticated predictions

## Tech Stack

**Modeling**
- Python, Jupyter Notebook
- Pandas, NumPy
- Matplotlib, Seaborn
- Scikit-Learn, XGBoost

**Application**
- Backend: FastAPI, SQLite, python-jose (JWT), Joblib
- Frontend: React (Vite), React Router

## Dataset

Kaggle — Clinical lung cancer survey dataset  
🔗 https://www.kaggle.com/datasets/aagambshah/lung-cancer-dataset

## Setup

Clone the repo and install all dependencies (covers notebook, backend, and modeling):

```bash
git clone https://github.com/Prasidda14/Lung-Cancer-Prediction
cd Lung-Cancer-Prediction
pip install -r requirements.txt
```

### Model Training / Notebook
```bash
jupyter notebook "Lung Cancer.ipynb"
```

### Backend
```bash
cd backend
uvicorn main:app --reload
```
Set a `JWT_SECRET` environment variable in production — the app falls back to a development default otherwise.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Disclaimer

This tool is for educational purposes only and is not a substitute for 
professional medical diagnosis.

## Author

**Prasidda Khadka** · [LinkedIn](https://www.linkedin.com/in/prasidda-khadka/) · [GitHub](https://github.com/Prasidda14)
