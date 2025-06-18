import { useEffect, useState } from 'react';
import { Typography, TextField, MenuItem, Grid, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert, Button, Paper, Tooltip } from '@mui/material';
import axios from 'axios';
import Layout from './Layout.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';

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

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [sortBy, setSortBy] = useState('averageRating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predicted, setPredicted] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [genres, setGenres] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);
  const [writerOptions, setWriterOptions] = useState([]);
  const [directorOptions, setDirectorOptions] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [domReady, setDomReady] = useState(false);

  // Prefill genre if present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genre = params.get('genres');
    const writer = params.get('writers');
    const director = params.get('directors');
    if (genre) {
      setSearchQuery(genre);
      setSearchType('genres');
      setSortBy('numVotes');
      setSortOrder('desc');
    } else if (writer) {
      setSearchQuery(writer);
      setSearchType('writers');
      setSortBy('numVotes');
      setSortOrder('desc');
    } else if (director) {
      setSearchQuery(director);
      setSearchType('directors');
      setSortBy('numVotes');
      setSortOrder('desc');
    }
  }, [location.search]);

  // fetch user ratings for quick display
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await axios.get(`${apiUrl}/my-ratings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ratingsMap = {};
        res.data.forEach(r => {
          ratingsMap[r.movie_id] = r.rating;
        });
        setUserRatings(ratingsMap);
      } catch {
        // ignore
      }
    };
    if (token) fetchRatings();
  }, [apiUrl, token]);

  // Fetch genres for the dropdown
  useEffect(() => {
    axios.get(`${apiUrl}/genres`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGenres(res.data))
      .catch(() => setGenres([]));
  }, [apiUrl, token]);

  // Fetch options for title, writers, and directors
  useEffect(() => {
    if (searchType === "title") {
      axios.get(`${apiUrl}/titles`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTitleOptions(res.data))
        .catch(() => setTitleOptions([]));
    } else if (searchType === "writers") {
      axios.get(`${apiUrl}/writers`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setWriterOptions(res.data))
        .catch(() => setWriterOptions([]));
    } else if (searchType === "directors") {
      axios.get(`${apiUrl}/directors`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setDirectorOptions(res.data))
        .catch(() => setDirectorOptions([]));
    }
  }, [searchType, apiUrl, token]);

  useEffect(() => { setDomReady(true); }, []);

  const handleSearch = async (query = searchQuery, type = searchType) => {
  if (!query || query.trim().length < 3) {
    setError('Invalid input, please try again.');
    setResults([]);
    return;
  }
  setLoading(true);
  try {
    const response = await axios.post(
      `${apiUrl}/search`,
      { [type]: query, sort_by: sortBy, sort_order: sortOrder },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Attach userRating to each result
    const resultsWithRatings = response.data.map(movie => ({
      ...movie,
      userRating: userRatings[movie.id]
    }));
    setResults(resultsWithRatings);
    setError(null);
    } catch (err) {
      setError('Failed to fetch search results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (movieId) => {
    const rating = prompt('Enter your rating (1-10):');
    if (!rating) return;
    await axios.post(`${apiUrl}/rate`, { movie_id: movieId, rating: parseFloat(rating) }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUserRatings(prev => ({ ...prev, [movieId]: parseFloat(rating) }));
  };

  const handlePredict = async (movieId) => {
    const res = await axios.post(`${apiUrl}/predict/${movieId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPredicted(prev => ({ ...prev, [movieId]: res.data.predictedRating }));
  };

  if (!domReady) return null;

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Search Movies/TV Shows
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto', mb: 2 }} />}
      <Grid
        container
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        {/* Search Query - flex grow and full width */}
        <Grid item xs={12} md={true} sx={{ minWidth: 240, flexGrow: 1 }}>
          {searchType === "genres" ? (
            <TextField
              select
              fullWidth
              label="Select Genre"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ style: { color: '#fff', fontSize: 20, height: 56 } }}
              InputLabelProps={{ style: { color: '#fff', fontSize: 18 } }}
              MenuProps={{
                PaperProps: {
                  sx: { backgroundColor: '#222', color: '#fff' }
                }
              }}
              sx={{ fontSize: 20 }}
            >
              {genres.map((genre) => (
                <MenuItem key={genre} value={genre} sx={{ color: '#fff' }}>{genre}</MenuItem>
              ))}
            </TextField>
          ) : searchType === "title" ? (
            <Autocomplete
              freeSolo
              options={titleOptions}
              value={searchQuery}
              onInputChange={(e, value) => setSearchQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Title"
                  fullWidth
                  InputProps={{ ...params.InputProps, style: { color: '#fff', fontSize: 20, height: 56 } }}
                  InputLabelProps={{ style: { color: '#fff', fontSize: 18 } }}
                />
              )}
              sx={{ backgroundColor: '#222', color: '#fff', fontSize: 20 }}
            />
          ) : searchType === "writers" ? (
            <Autocomplete
              freeSolo
              options={writerOptions}
              value={searchQuery}
              onInputChange={(e, value) => setSearchQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Writer"
                  fullWidth
                  InputProps={{ ...params.InputProps, style: { color: '#fff', fontSize: 20, height: 56 } }}
                  InputLabelProps={{ style: { color: '#fff', fontSize: 18 } }}
                />
              )}
              sx={{ backgroundColor: '#222', color: '#fff', fontSize: 20 }}
            />
          ) : searchType === "directors" ? (
            <Autocomplete
              freeSolo
              options={directorOptions}
              value={searchQuery}
              onInputChange={(e, value) => setSearchQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Director"
                  fullWidth
                  InputProps={{ ...params.InputProps, style: { color: '#fff', fontSize: 20, height: 56 } }}
                  InputLabelProps={{ style: { color: '#fff', fontSize: 18 } }}
                />
              )}
              sx={{ backgroundColor: '#222', color: '#fff', fontSize: 20 }}
            />
          ) : (
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ style: { color: '#fff', fontSize: 20, height: 56 } }}
              InputLabelProps={{ style: { color: '#fff', fontSize: 18 } }}
            />
          )}
        </Grid>
        {/* Search By - fixed width */}
        <Grid item xs={6} md="auto" sx={{ minWidth: 180 }}>
          <TextField
            select
            fullWidth
            label="Search By"
            value={searchType}
            onChange={e => {
              setSearchType(e.target.value);
              if (e.target.value === "genres") {
                setSearchQuery(genres[0] || "");
              } else {
                setSearchQuery("");
              }
            }}
            InputProps={{ style: { color: '#fff', fontSize: 16, height: 56 } }}
            InputLabelProps={{ style: { color: '#fff', fontSize: 16 } }}
            MenuProps={{
              PaperProps: {
                sx: { backgroundColor: '#222', color: '#fff' }
              }
            }}
          >
            <MenuItem value="title" sx={{ color: '#fff' }}>Title</MenuItem>
            <MenuItem value="genres" sx={{ color: '#fff' }}>Genres</MenuItem>
            <MenuItem value="writers" sx={{ color: '#fff' }}>Writers</MenuItem>
            <MenuItem value="directors" sx={{ color: '#fff' }}>Directors</MenuItem>
          </TextField>
        </Grid>
        {/* Sort By - fixed width */}
        <Grid item xs={6} md="auto" sx={{ minWidth: 180 }}>
          <TextField
            select
            fullWidth
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            InputProps={{ style: { color: '#fff', fontSize: 16, height: 56 } }}
            InputLabelProps={{ style: { color: '#fff', fontSize: 16 } }}
            MenuProps={{
              PaperProps: {
                sx: { backgroundColor: '#222', color: '#fff' }
              }
            }}
          >
            <MenuItem value="averageRating" sx={{ color: '#fff' }}>Average Rating</MenuItem>
            <MenuItem value="numVotes" sx={{ color: '#fff' }}>Number of Votes</MenuItem>
          </TextField>
        </Grid>
        {/* Sort Order - fixed width */}
        <Grid item xs={6} md="auto" sx={{ minWidth: 180 }}>
          <TextField
            select
            fullWidth
            label="Sort Order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            InputProps={{ style: { color: '#fff', fontSize: 16, height: 56 } }}
            InputLabelProps={{ style: { color: '#fff', fontSize: 16 } }}
            MenuProps={{
              PaperProps: {
                sx: { backgroundColor: '#222', color: '#fff' }
              }
            }}
          >
            <MenuItem value="asc" sx={{ color: '#fff' }}>Ascending</MenuItem>
            <MenuItem value="desc" sx={{ color: '#fff' }}>Descending</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      {/* Search button - separate row, full width with spacing */}
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={() => handleSearch()}
          fullWidth
          sx={{
            mt: 2,
            mb: 4,
            py: 2,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 2,
            background: 'rgba(30,30,40,0.85)',
            color: '#fff',
            border: '1.5px solid rgba(144,202,249,0.25)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
            borderRadius: 2,
            textTransform: 'uppercase',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              background: 'rgba(30,40,60,0.95)',
              border: '1.5px solid #90caf9',
              color: '#fff',
            }
          }}
        >
          Search
        </Button>
      </Grid>
      {results.length > 0 && (
        <Paper sx={{ overflowX: 'auto', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Title</TableCell>
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
              {results.map((movie) => (
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
                  <TableCell align="center">
                    {/* Rating logic */}
                    {movie.userRating === null || movie.userRating === undefined ? (
                      <Button
                        size="small"
                        onClick={() => {
                          if (userRatings[movie.id] !== null && userRatings[movie.id] !== undefined) return;
                          handleRate(movie.id);
                        }}
                        disabled={userRatings[movie.id] !== null && userRatings[movie.id] !== undefined}
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
                          ...(userRatings[movie.id] !== null && userRatings[movie.id] !== undefined ? { backgroundColor: '#444', color: '#bbb', pointerEvents: 'none' } : {})
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
                          movie.userRating !== null && movie.userRating !== undefined
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
                            (userRatings[movie.id] !== null && userRatings[movie.id] !== undefined)
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

export default Search;