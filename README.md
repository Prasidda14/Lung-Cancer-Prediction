# Lung Cancer Prediction Model

An end-to-end machine learning project for predicting lung cancer risk using 
clinical survey data, extended into a full-stack web application.

## Overview

This project walks through the full ML pipeline — data preprocessing, 
exploratory data analysis (EDA), feature engineering, model training, and 
evaluation — to identify the most effective classification model for 
predicting lung cancer from patient survey responses. The trained models are 
served through a FastAPI backend and consumed by a React frontend, where 
users answer an 11-question survey and receive real-time predictions from 
the Random Forest and XGBoost models side-by-side.

## Models Compared

| Model | Notes |
|---|---|
| Random Forest | Ensemble method; strong baseline performance |
| XGBoost | Gradient boosting; evaluated against Random Forest |

Evaluation metrics: Classification report, confusion matrix, accuracy score.

## Pipeline Steps

1. Data loading and inspection
2. Handling missing values and data types
3. Exploratory Data Analysis (EDA) with visualisations
4. Feature engineering and selection (incl. an Anxiety × Yellow Fingers interaction term)
5. Model training (Random Forest and XGBoost)
6. Performance evaluation and comparison
7. Model export (joblib) for deployment
8. Serving via an authenticated FastAPI backend + React frontend for interactive predictions

## Tech Stack

**Modeling**
- Python, Jupyter Notebook
- Pandas, NumPy
- Matplotlib, Seaborn
- Scikit-Learn, XGBoost

**Application**
- Backend: FastAPI, SQLAlchemy async, PostgreSQL, Alembic, JWT authentication, Joblib
- Frontend: React (Vite), React Router

## Dataset

Kaggle — Clinical lung cancer survey dataset  
🔗 https://www.kaggle.com/datasets/aagambshah/lung-cancer-dataset

## Setup

### Model Training / Notebook
\`\`\`bash
git clone https://github.com/Prasidda14/Lung-Cancer-Prediction
cd Lung-Cancer-Prediction
pip install -r requirements.txt
jupyter notebook "Lung Cancer.ipynb"
\`\`\`

### Backend
\`\`\`bash
cd backend
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your PostgreSQL URL and a strong JWT secret
alembic upgrade head
uvicorn main:app --reload
\`\`\`

The backend provides `POST /auth/register`, `POST /auth/login`, and
`GET /auth/me`. The `POST /predict` endpoint requires the bearer token returned
by login. PostgreSQL must be running before applying the migration.

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Disclaimer

This tool is for educational purposes only and is not a substitute for 
professional medical diagnosis.

## Author

**Prasidda Khadka** · [LinkedIn](https://www.linkedin.com/in/prasidda-khadka/) · [GitHub](https://github.com/Prasidda14)