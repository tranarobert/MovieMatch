import React, { useEffect, useState, useContext } from 'react';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert, Button, Paper, Tooltip } from '@mui/material';
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

function TopTitles() {
  const { logout } = useContext(AuthContext);
  const [titles, setTitles] = useState([]);
  const [predicted, setPredicted] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access_token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    const fetchTop10 = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/top10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitles(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load top 10 movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTop10();
  }, [logout, apiUrl, token]);

  const handleRate = async (movieId) => {
    const rating = prompt('Enter your rating (1-10):');
    if (!rating) return;
    await axios.post(`${apiUrl}/rate`, { movie_id: movieId, rating: parseFloat(rating) }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTitles(prev =>
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

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Top 10 Titles
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto', mb: 2 }} />}
      {titles.length > 0 && (
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
              {titles.map((movie) => (
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
                    {/* Your Rating logic */}
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
                          ...(movie.userRating !== null && movie.userRating !== undefined
                            ? { backgroundColor: '#444', color: '#bbb', pointerEvents: 'none' }
                            : {})
                        }}
                      >
                        Rate
                      </Button>
                    ) : (
                      movie.userRating
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {/* Predicted logic */}
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
                            ? { backgroundColor: '#444', color: '#bbb', pointerEvents: 'none' }
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

export default TopTitles;