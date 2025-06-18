import os
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Adaugă calea către folderul părinte pentru a importa corect modulele din backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from recommender import Recommender
from database import get_db

os.makedirs("eval", exist_ok=True)
db = next(get_db())
recommender = Recommender(db)
# Asigură-te că ai acces la datele de intrare pentru clustering
if hasattr(recommender, "features"):
    features = recommender.features
else:
    # Reconstruiește features dacă nu există ca atribut
    # Poți folosi movie_data fără coloanele non-numerice
    features = recommender.movie_data.drop(columns=["title", "startYear"], errors="ignore").values

inertias = []
silhouettes = []
K = range(2, 21)
for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(features)
    inertias.append(kmeans.inertia_)
    silhouettes.append(silhouette_score(features, labels))

plt.figure(figsize=(12,5))
plt.subplot(1,2,1)
plt.plot(K, inertias, 'bx-')
plt.xlabel('k')
plt.ylabel('Inertia')
plt.title('Elbow Method')
plt.subplot(1,2,2)
plt.plot(K, silhouettes, 'rx-')
plt.xlabel('k')
plt.ylabel('Silhouette Score')
plt.title('Silhouette Score')
plt.tight_layout()
plt.savefig("eval/kmeans_eval.svg")
plt.close()
print("KMeans evaluation plots saved to eval/kmeans_eval.svg")