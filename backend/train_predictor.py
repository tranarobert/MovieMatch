from database import get_db
from models import Movie, Rating
from recommender import Recommender
from predict import RatingPredictor

db = next(get_db())
recommender = Recommender(db)
movies = db.query(Movie).all()
ratings = db.query(Rating).all()
mlb_genres = recommender.mlb_genres

rating_predictor = RatingPredictor(model_dir="models")
rating_predictor.fit(movies, ratings, mlb_genres)
print("Model trained and saved.")