import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MultiLabelBinarizer
from sqlalchemy.orm import Session
from models import Movie, Rating
import joblib
import os

def split_comma_space(x):
    return x.split(", ") if x else []

class Recommender:
    def __init__(self, db: Session, load_only: bool = False, path="recommender_data"):
        self.db = db
        self.kmeans = KMeans(n_clusters=50, random_state=42, n_init=10)
        self.movie_data = None
        self.user_ratings = None
        self.movie_clusters = None
        self.mlb_genres = MultiLabelBinarizer()
        if load_only and os.path.exists(path):
            self.load(path)
        else:
            self.fit()

    def fit(self):
        movies = self.db.query(Movie).all()
        ratings = self.db.query(Rating).all()
        movie_data = pd.DataFrame([{
            "id": m.id,
            "genres": m.genres,
            "averageRating": m.averageRating,
            "startYear": m.startYear,
            "numVotes": m.numVotes
        } for m in movies])
        self.movie_data = movie_data.set_index("id")
        self.movie_data["genres_list"] = self.movie_data["genres"].apply(split_comma_space)
        self.mlb_genres.fit(self.movie_data["genres_list"])
        genres_encoded = self.mlb_genres.transform(self.movie_data["genres_list"])
        features = np.concatenate([genres_encoded, genres_encoded], axis=1)  # double weight
        self.features = features
        self.movie_clusters = self.kmeans.fit_predict(features)
        self.movie_data["cluster"] = self.movie_clusters
        if ratings:
            self.user_ratings = pd.DataFrame([{
                "user_id": r.user_id,
                "movie_id": r.movie_id,
                "rating": r.rating
            } for r in ratings])
        else:
            self.user_ratings = pd.DataFrame(columns=["user_id", "movie_id", "rating"])

    def get_recommendations(self, user_id: int, n: int = 10, rating_predictor=None):
        user_ratings = self.user_ratings[self.user_ratings["user_id"] == user_id]
        if user_ratings.empty:
            return self._get_top_n_movies(n)
         
        rated_movies = user_ratings.merge(self.movie_data, left_on="movie_id", right_index=True)
        cluster_ratings = rated_movies.groupby("cluster")["rating"].mean().to_dict()
        rated_movie_ids = set(user_ratings["movie_id"])
        cluster_scores = [(cluster, rating) for cluster, rating in cluster_ratings.items()]
        cluster_scores.sort(key=lambda x: x[1], reverse=True)
        
        candidate_movies = set()
        for cluster, _ in cluster_scores:
            cluster_movies = self.movie_data[self.movie_data["cluster"] == cluster].index
            candidate_movies.update(cluster_movies)
        
        candidate_movies = candidate_movies - rated_movie_ids

        # limit to 100 titles for performance
        candidate_movies = list(candidate_movies)[:100]

        movie_objs = self.db.query(Movie).filter(Movie.id.in_(candidate_movies)).all()
        movie_map = {m.id: m for m in movie_objs}

        movie_scores = []
        for movie_id in candidate_movies:
            movie = movie_map.get(movie_id)
            if not movie:
                continue
            cluster = self.movie_data.loc[movie_id, "cluster"]
            cluster_score = cluster_ratings.get(cluster, 0.0)
            avg_rating = movie.averageRating if movie.averageRating is not None else 0
            num_votes = movie.numVotes if movie.numVotes is not None else 0

            # Predict user rating if predictor is provided
            predicted_rating = None
            if rating_predictor is not None:
                try:
                    predicted_rating = rating_predictor.predict(user_id, movie_id)
                except Exception:
                    predicted_rating = None

            # Weighted score: prioritize both average rating and number of votes
            # IMDb formula: weighted = (v/(v+m))*R + (m/(v+m))*C
            # where R = avg_rating, v = num_votes, m = 1500 (threshold), C = mean of all avg_ratings
            m = 1500
            C = self.movie_data["averageRating"].mean() if not np.isnan(self.movie_data["averageRating"].mean()) else 0
            if num_votes > 0:
                weighted_score = (num_votes / (num_votes + m)) * avg_rating + (m / (num_votes + m)) * C
            else:
                weighted_score = 0

            movie_scores.append({
                "id": movie_id,
                "title": movie.title,
                "averageRating": avg_rating,
                "startYear": movie.startYear,
                "numVotes": num_votes,
                "cluster_score": cluster_score,
                "weighted_score": weighted_score,
                "predicted_rating": predicted_rating
            })

        # Sort by predicted_rating if available, else by weighted_score
        movie_scores.sort(
            key=lambda x: (x["predicted_rating"] if x["predicted_rating"] is not None else -1, x["weighted_score"]),
            reverse=True
        )
        return movie_scores[:n]

    def _get_top_n_movies(self, n: int = 10):
        movies = self.db.query(Movie).order_by(Movie.averageRating.desc()).limit(n).all()
        return [
            {
                "id": m.id,
                "title": m.title,
                "averageRating": m.averageRating,
                "startYear": m.startYear,
                "numVotes": m.numVotes,
                "cluster_score": 0.0
            }
            for m in movies
        ]

    def train_model(self):
        self.fit()

    def save(self, path="recommender_data"):
        if not os.path.exists(path):
            os.makedirs(path)
        joblib.dump(self.kmeans, f"{path}/kmeans.pkl")
        joblib.dump(self.movie_data, f"{path}/movie_data.pkl")
        joblib.dump(self.user_ratings, f"{path}/user_ratings.pkl")
        joblib.dump(self.mlb_genres, f"{path}/mlb_genres.pkl")

    def load(self, path="recommender_data"):
        self.kmeans = joblib.load(f"{path}/kmeans.pkl")
        self.movie_data = joblib.load(f"{path}/movie_data.pkl")
        self.user_ratings = joblib.load(f"{path}/user_ratings.pkl")
        self.mlb_genres = joblib.load(f"{path}/mlb_genres.pkl")