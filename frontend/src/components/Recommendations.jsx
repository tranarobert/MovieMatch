import { useState, useEffect, useContext } from 'react';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert, Button, Paper, Box, Tooltip } from '@mui/material';
import axios from 'axios';
import Layout from './Layout';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const titleTypeMap = {
  movie: "Movie",
  tvSeries: "TV Series",
  tvEpisode: "TV Episode",
  tvMiniSeries: "TV Mini Series",
  tvMovie: "TV Movie",
  tvShort: "TV Short",
  tvSpecial: "TV Special",
  short: "Short",
  video: "Video",
  videoGame: "Video Game"
};

function Recommendations() {
  const { logout } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [predicted, setPredicted] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('access_token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No recommendations available! Try rating a few titles.');
      } else {
        setError('Failed to fetch recommendations. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }
    fetchRecommendations();
    // eslint-disable-next-line
  }, [logout, apiUrl, token]);

  const handleRate = async (movieId) => {
    const rating = prompt('Enter your rating (1-10):');
    if (!rating) return;
    await axios.post(`${apiUrl}/rate`, { movie_id: movieId, rating: parseFloat(rating) }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRecommendations(prev =>
      prev.map(movie =>
        movie.id === movieId
          ? { ...movie, userRating: parseFloat(rating) }
          : movie
      )
    );
  };

  const handlePredict = async (movieId) => {
    const res = await axios.post(`${apiUrl}/predict/${movieId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPredicted(prev => ({ ...prev, [movieId]: res.data.predictedRating }));
  };

  // --- Refresh Button Handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Call backend endpoint to retrain KMeans and recommender
      await axios.post(`${apiUrl}/retrain-recommender`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // After retraining, fetch new recommendations
      await fetchRecommendations();
    } catch (err) {
      setError('Failed to refresh recommendations.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1 }}>
          Recommended Titles
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            minWidth: 120,
            background: 'rgba(30,30,40,0.85)',
            color: '#fff',
            fontWeight: 600,
            border: '1.5px solid rgba(144,202,249,0.25)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(30,40,60,0.95)',
              border: '1.5px solid #90caf9',
              color: '#fff',
            }
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto', mb: 2 }} />}
      {recommendations.length > 0 && (
        <Paper sx={{ overflowX: 'auto', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Year</TableCell>
                <TableCell align="center">End Year</TableCell>
                <TableCell align="center">Episodes</TableCell>
                <TableCell align="center">Genres</TableCell>
                <TableCell align="center">Runtime (min)</TableCell>
                <TableCell align="center">Ratings</TableCell>
                <TableCell align="center">Avg Rating</TableCell>
                <TableCell align="center">Writers</TableCell>
                <TableCell align="center">Directors</TableCell>
                <TableCell align="center">Your Rating</TableCell>
                <TableCell align="center">Predicted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recommendations.map((movie) => (
                <TableRow key={movie.id}>
                  <TableCell>{movie.title}</TableCell>
                  <TableCell align="center">{titleTypeMap[movie.titleType] || movie.titleType}</TableCell>
                  <TableCell align="center">{movie.startYear}</TableCell>
                  <TableCell align="center">{movie.endYear || ''}</TableCell>
                  <TableCell align="center">{movie.totalEpisodes || ''}</TableCell>
                  <TableCell>
                    {movie.genres
                      ? movie.genres.split(',').map((genre, idx) => (
                          <span
                            key={genre.trim()}
                            style={{
                              cursor: 'pointer',
                              color: '#90caf9',
                              textDecoration: 'underline',
                              marginRight: idx < movie.genres.split(',').length - 1 ? 8 : 0,
                            }}
                            onClick={() => {
                              navigate(`/search?genres=${encodeURIComponent(genre.trim())}`);
                            }}
                          >
                            {genre.trim()}
                          </span>
                        ))
                      : ''}
                  </TableCell>
                  <TableCell align="center">{movie.runtimeMinutes}</TableCell>
                  <TableCell align="center">{movie.numVotes?.toLocaleString('de-DE')}</TableCell>
                  <TableCell align="center">{movie.averageRating}</TableCell>
                  {/* Writers */}
                  <TableCell align="center">
                    {movie.writers ? (
                      <Tooltip
                        title={
                          <span>
                            {movie.writers.split(',').map((writer, idx) => (
                              <span
                                key={writer.trim()}
                                style={{
                                  cursor: 'pointer',
                                  color: '#90caf9',
                                  textDecoration: 'underline',
                                  display: 'inline-block',
                                  marginRight: 8,
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/search?writers=${encodeURIComponent(writer.trim())}`);
                                }}
                              >
                                {writer.trim()}
                              </span>
                            ))}
                          </span>
                        }
                        arrow
                        placement="top"
                        enterTouchDelay={0}
                      >
                        <span>
                          {movie.writers
                            .split(',')
                            .slice(0, 2)
                            .map((writer, idx, arr) => (
                              <span
                                key={writer.trim()}
                                style={{
                                  cursor: 'pointer',
                                  color: '#90caf9',
                                  textDecoration: 'underline',
                                  marginRight: idx < arr.length - 1 ? 8 : 0,
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/search?writers=${encodeURIComponent(writer.trim())}`);
                                }}
                              >
                                {writer.trim()}
                              </span>
                            ))}
                          {movie.writers.split(',').length > 2 && (
                            <span style={{ color: '#bbb', marginLeft: 4 }}>
                              +{movie.writers.split(',').length - 2} more
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </TableCell>
                  {/* Directors */}
                  <TableCell align="center">
                    {movie.directors ? (
                      <Tooltip
                        title={
                          <span>
                            {movie.directors.split(',').map((director, idx) => (
                              <span
                                key={director.trim()}
                                style={{
                                  cursor: 'pointer',
                                  color: '#90caf9',
                                  textDecoration: 'underline',
                                  display: 'inline-block',
                                  marginRight: 8,
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/search?directors=${encodeURIComponent(director.trim())}`);
                                }}
                              >
                                {director.trim()}
                              </span>
                            ))}
                          </span>
                        }
                        arrow
                        placement="top"
                        enterTouchDelay={0}
                      >
                        <span>
                          {movie.directors
                            .split(',')
                            .slice(0, 2)
                            .map((director, idx, arr) => (
                              <span
                                key={director.trim()}
                                style={{
                                  cursor: 'pointer',
                                  color: '#90caf9',
                                  textDecoration: 'underline',
                                  marginRight: idx < arr.length - 1 ? 8 : 0,
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/search?directors=${encodeURIComponent(director.trim())}`);
                                }}
                              >
                                {director.trim()}
                              </span>
                            ))}
                          {movie.directors.split(',').length > 2 && (
                            <span style={{ color: '#bbb', marginLeft: 4 }}>
                              +{movie.directors.split(',').length - 2} more
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </TableCell>
                  {/* Move Your Rating and Predicted to the end */}
                  <TableCell align="center">
                    {/* Your Rating column */}
                    {movie.userRating === null || movie.userRating === undefined ? (
                      <Button
                        size="small"
                        onClick={() => {
                          if (movie.userRating !== null && movie.userRating !== undefined) return;
                          handleRate(movie.id);
                        }}
                        disabled={movie.userRating !== null && movie.userRating !== undefined}
                        sx={{
                          background: 'rgba(30,30,40,0.85)',
                          color: '#fff',
                          fontWeight: 700,
                          border: '1.5px solid rgba(144,202,249,0.25)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
                          textTransform: 'none',
                          fontFamily: "'Archivo', Arial, sans-serif",
                          fontSize: 15,
                          px: 2,
                          '&:hover': {
                            background: 'rgba(30,40,60,0.95)',
                            border: '1.5px solid #90caf9',
                            color: '#fff',
                          },
                          ...(movie.userRating !== null && movie.userRating !== undefined ? { backgroundColor: '#444', color: '#bbb', pointerEvents: 'none' } : {})
                        }}
                      >
                        Rate
                      </Button>
                    ) : (
                      movie.userRating
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {/* Predicted column with Predict button */}
                    {predicted[movie.id] !== undefined ? (
                      predicted[movie.id].toFixed(2)
                    ) : (
                      <Button
                        size="small"
                        onClick={() => handlePredict(movie.id)}
                        disabled={
                          predicted[movie.id] !== undefined ||
                          (movie.userRating !== null && movie.userRating !== undefined)
                        }
                        sx={{
                          background: 'rgba(30,30,40,0.85)',
                          color: '#fff',
                          fontWeight: 700,
                          border: '1.5px solid rgba(144,202,249,0.25)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
                          textTransform: 'none',
                          fontFamily: "'Archivo', Arial, sans-serif",
                          fontSize: 15,
                          px: 2,
                          '&:hover': {
                            background: 'rgba(30,40,60,0.95)',
                            border: '1.5px solid #90caf9',
                            color: '#fff',
                          },
                          ...(predicted[movie.id] !== undefined ||
                            (movie.userRating !== null && movie.userRating !== undefined)
                            ? { backgroundColor: '#444', color: '#bbb', pointerEvents: 'none'}
                            : {})
                        }}
                      >
                        Predict
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Layout>
  );
}

export default Recommendations;