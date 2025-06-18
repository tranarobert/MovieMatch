import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from database import get_db
from models import Movie, Rating
from recommender import Recommender
from predict import RatingPredictor
from utils import extract_features

os.makedirs("eval", exist_ok=True)
db = next(get_db())
recommender = Recommender(db)
movies = db.query(Movie).all()
ratings = db.query(Rating).all()
mlb_genres = recommender.mlb_genres

rating_predictor = RatingPredictor(model_dir="models")
rating_predictor.load()

# Prepare data
X = []
y = []
for r in ratings:
    movie = next((m for m in movies if m.id == r.movie_id), None)
    if movie:
        X.append(extract_features(movie, mlb_genres))
        y.append(int(round(r.rating)))
X = np.array(X)
y = np.array(y)

# Predict with XGBoost
y_pred_xgb = rating_predictor.xgb.predict(rating_predictor.scaler.transform(X))
y_pred_xgb = np.clip(np.round(y_pred_xgb), 1, 10).astype(int)
# Predict with Random Forest
y_pred_rf = rating_predictor.rf.predict(rating_predictor.scaler.transform(X))
y_pred_rf = np.clip(np.round(y_pred_rf), 1, 10).astype(int)

# Classification report and confusion matrix for XGBoost
report_xgb = classification_report(y, y_pred_xgb, digits=4)
cm_xgb = confusion_matrix(y, y_pred_xgb, labels=range(1, 11))
acc_xgb = accuracy_score(y, y_pred_xgb)

# Classification report and confusion matrix for Random Forest
report_rf = classification_report(y, y_pred_rf, digits=4)
cm_rf = confusion_matrix(y, y_pred_rf, labels=range(1, 11))
acc_rf = accuracy_score(y, y_pred_rf)

# Save confusion matrices as images
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.imshow(cm_xgb, cmap='Blues')
plt.title(f'XGBoost Confusion Matrix\nAccuracy: {acc_xgb:.4f}')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.colorbar()
plt.subplot(1, 2, 2)
plt.imshow(cm_rf, cmap='Greens')

plt.tight_layout()
plt.savefig("eval/prediction_eval.svg")
plt.close()

# Save classification reports as text
with open("eval/xgb_classification_report.txt", "w") as f:
    f.write(report_xgb)
with open("eval/rf_classification_report.txt", "w") as f:
    f.write(report_rf)

print("Prediction evaluation saved to eval/prediction_eval.jpg and text reports.")