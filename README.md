# Lung Cancer Prediction Model

An end-to-end machine learning project for predicting lung cancer risk using 
clinical survey data.

## Overview

This project walks through the full ML pipeline — data preprocessing, 
exploratory data analysis (EDA), feature engineering, model training, and 
evaluation — to identify the most effective classification model for 
predicting lung cancer from patient survey responses.

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
4. Feature engineering and selection
5. Model training (Random Forest vs XGBoost)
6. Performance evaluation and comparison
7. Conclusions on best-performing model

## Tech Stack

- Python, Jupyter Notebook
- Pandas, NumPy
- Matplotlib, Seaborn
- Scikit-Learn, XGBoost

## Dataset

Kaggle — Clinical lung cancer survey dataset  
🔗 https://www.kaggle.com/datasets/aagambshah/lung-cancer-dataset

## Setup

```bash
git clone https://github.com/Prasidda14/Lung-Cancer-Prediction
cd Lung-Cancer-Prediction
pip install -r requirements.txt
jupyter notebook "Lung Cancer.ipynb"
```

## Author

**Prasidda Khadka** · [LinkedIn](https://www.linkedin.com/in/prasidda-khadka/) · [GitHub](https://github.com/Prasidda14)
