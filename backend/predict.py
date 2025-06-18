import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os
from utils import extract_features

class RatingPredictor:
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        self.xgb = XGBRegressor(n_estimators=300, random_state=42, max_depth=3, verbosity=0)
        self.rf = RandomForestRegressor(n_estimators=200, random_state=42)
        self.scaler = StandardScaler()
        self.fitted = False

    def fit(self, movies, ratings, mlb_genres):
        X = []
        y = []
        for r in ratings:
            movie = next((m for m in movies if m.id == r.movie_id), None)
            if movie:
                X.append(extract_features(movie, mlb_genres))
                y.append(r.rating)
        X = np.array(X)
        y = np.array(y)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        X_res, y_res = X_train, y_train
        X_res_scaled = self.scaler.fit_transform(X_res)
        X_test_scaled = self.scaler.transform(X_test)
        self.xgb.fit(X_res_scaled, y_res)
        self.rf.fit(X_res_scaled, y_res)
        self.fitted = True
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
        joblib.dump(self.xgb, os.path.join(self.model_dir, "xgb_regressor.pkl"))
        joblib.dump(self.rf, os.path.join(self.model_dir, "rf_regressor.pkl"))
        joblib.dump(self.scaler, os.path.join(self.model_dir, "scaler.pkl"))
        from sklearn.metrics import mean_squared_error, r2_score
        xgb_pred = self.xgb.predict(X_test_scaled)
        rf_pred = self.rf.predict(X_test_scaled)
        print("\n--- XGBoost ---")
        print("MSE:", mean_squared_error(y_test, xgb_pred))
        print("R2 :", r2_score(y_test, xgb_pred))
        print("\n--- Random Forest ---")
        print("MSE:", mean_squared_error(y_test, rf_pred))
        print("R2 :", r2_score(y_test, rf_pred))

    def load(self):
        self.xgb = joblib.load(os.path.join(self.model_dir, "xgb_regressor.pkl"))
        self.rf = joblib.load(os.path.join(self.model_dir, "rf_regressor.pkl"))
        self.scaler = joblib.load(os.path.join(self.model_dir, "scaler.pkl"))
        self.fitted = True

    def predict(self, movie, mlb_genres, model="xgb"):
        features = extract_features(movie, mlb_genres)
        X = pd.DataFrame([features])
        X_scaled = self.scaler.transform(X)
        if model == "xgb":
            return float(self.xgb.predict(X_scaled)[0])
        elif model == "rf":
            return float(self.rf.predict(X_scaled)[0])
        elif model == "ensemble":
            xgb_pred = self.xgb.predict(X_scaled)
            rf_pred = self.rf.predict(X_scaled)
            return float((xgb_pred + rf_pred) / 2)
        else:
            raise ValueError("Unknown model: choose 'xgb' or 'rf'")