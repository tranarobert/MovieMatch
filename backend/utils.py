import numpy as np

def extract_features(movie, mlb_genres):
    # Genres as binary vector double weight
    genres_list = movie.genres.split(", ") if movie.genres else []
    genres_vec = mlb_genres.transform([genres_list])[0]
    genres_vec = np.concatenate([genres_vec, genres_vec])  # double weight

    # Numeric features
    avg_rating = movie.averageRating if movie.averageRating is not None else 0.0
    num_votes = movie.numVotes if movie.numVotes is not None else 0

    # Combine all features
    features = np.concatenate([genres_vec, [avg_rating, num_votes]])
    return features