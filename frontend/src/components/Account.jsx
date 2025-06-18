import { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, Divider, Tooltip } from '@mui/material';
import Layout from './Layout.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Account() {
  const [user, setUser] = useState({ email: '', username: '' });
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [ratings, setRatings] = useState([]);
  const [editRating, setEditRating] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userRes = await axios.get(`${apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } });
        setUser({ email: userRes.data.email, username: userRes.data.username });
        const ratingsRes = await axios.get(`${apiUrl}/my-ratings`, { headers: { Authorization: `Bearer ${token}` } });
        setRatings(ratingsRes.data);
      } catch {
        setError('Failed to load account data.');
      }
    };
    fetchData();
  }, [apiUrl]);

  const handleUpdate = async () => {
    if (!currentPassword) {
      setError('Current password is required to make changes.');
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const updateData = { current_password: currentPassword };
      if (user.newUsername) updateData.username = user.newUsername;
      if (user.newEmail) updateData.email = user.newEmail;
      if (password) updateData.password = password;

      await axios.put(`${apiUrl}/me`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Account updated!');
      setError('');
      setPassword('');
      setCurrentPassword('');
      setUser(u => ({
        ...u,
        username: u.newUsername || u.username,
        email: u.newEmail || u.email,
        newUsername: '',
        newEmail: ''
      }));
    } catch {
      setError('Failed to update account. Check your current password.');
      setSuccess('');
    }
  };

  const handleEditRating = (id, value) => {
    setEditRating((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveRating = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      // Find the rating object to get the correct rating_id
      const rating = ratings.find(r => r.movie_id === id);
      if (!rating) return;
      
      await axios.put(`${apiUrl}/my-ratings/${rating.rating_id}`, { rating: parseFloat(editRating[id]) }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setRatings(ratings.map(r => r.movie_id === id ? { ...r, rating: parseFloat(editRating[id]) } : r));
      setEditRating((prev) => ({ ...prev, [id]: undefined }));
    } catch {
      setError('Failed to update rating.');
    }
  };

  const handleDeleteRating = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const rating = ratings.find(r => r.movie_id === id);
      if (!rating) return;
      
      await axios.delete(`${apiUrl}/my-ratings/${rating.rating_id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setRatings(ratings.filter(r => r.movie_id !== id));
    } catch {
      setError('Failed to delete rating.');
    }
  };

  const handleGenreClick = (genre) => {
    navigate(`/search?searchBy=genre&query=${encodeURIComponent(genre.trim())}`);
  };

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

  return (
    <Layout>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mx: 2,
          mb: 4,
          mt: 2,
          width: 'auto',
          maxWidth: 'none',
          background: 'rgba(30,30,40,0.85)',
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif" }}>
          Account
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Username Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 2 }}>
          <Box sx={{ flex: 1, pr: 2, display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 500, fontFamily: "'Archivo', Arial, sans-serif", minWidth: 170 }}>
              Current Username:{' '}
              <span
                className="animated-username"
                style={{
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #fff 0%, #90caf9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'all 0.2s',
                  marginLeft: 8,
                  fontStyle: 'normal'
                }}
              >
                {user.username}
              </span>
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.18)', mx: 2 }} />
          <Box sx={{ flex: 1 }}>
            <TextField
              label="New Username"
              value={user.newUsername || ''}
              onChange={e => setUser(u => ({ ...u, newUsername: e.target.value }))}
              fullWidth
              margin="normal"
              disabled={!currentPassword}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
              placeholder={user.username}
            />
          </Box>
        </Box>

        {/* Email Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 2 }}>
          <Box sx={{ flex: 1, pr: 2, display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 500, fontFamily: "'Archivo', Arial, sans-serif", minWidth: 170 }}>
              Current E-Mail:{' '}
              <span
                className="animated-username"
                style={{
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #fff 0%, #90caf9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'all 0.2s',
                  marginLeft: 8,
                  fontStyle: 'normal'
                }}
              >
                {user.email}
              </span>
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.18)', mx: 2 }} />
          <Box sx={{ flex: 1 }}>
            <TextField
              label="New Email"
              value={user.newEmail || ''}
              onChange={e => setUser(u => ({ ...u, newEmail: e.target.value }))}
              fullWidth
              margin="normal"
              disabled={!currentPassword}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
              placeholder={user.email}
            />
          </Box>
        </Box>

        {/* Password Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 2 }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.18)', mx: 2 }} />
          <Box sx={{ flex: 1 }}>
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              disabled={!currentPassword}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
          </Box>
        </Box>

        <Button 
          variant="contained" 
          onClick={handleUpdate} 
          fullWidth 
          disabled={!currentPassword}
          sx={{
            fontWeight: 600,
            fontFamily: "'Archivo', Arial, sans-serif",
            mt: 2,
            background: 'rgba(30,30,40,0.85)',
            color: '#90caf9',
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
          Update
        </Button>
      </Paper>
      
      {/* Ratings Table */}
      <Paper
        elevation={4}
        sx={{
          mx: 2,
          mb: 2,
          mt: 0,
          p: 3,
          borderRadius: 3,
          width: 'auto',
          maxWidth: 'none',
          background: 'rgba(40,40,60,0.7)',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600, fontFamily: "'Archivo', Arial, sans-serif" }}>
          Your Ratings
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Title</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Type</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Year</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>End Year</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Episodes</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Genres</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Runtime (min)</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Avg Rating</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Your Rating</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Writers</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>Directors</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Archivo', Arial, sans-serif" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ratings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ color: '#aaa' }}>
                  No ratings yet.
                </TableCell>
              </TableRow>
            ) : (
              ratings.map(rating => (
                <TableRow key={rating.movie_id}>
                  <TableCell sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.title}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {titleTypeMap[rating.titleType] || rating.titleType}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.startYear}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.endYear || ''}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.totalEpisodes || ''}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.genres
                      ? rating.genres.split(',').map((genre, idx) => (
                          <span
                            key={genre.trim()}
                            style={{
                              cursor: 'pointer',
                              color: '#90caf9',
                              textDecoration: 'underline',
                              marginRight: idx < rating.genres.split(',').length - 1 ? 8 : 0,
                            }}
                            onClick={() => handleGenreClick(genre)}
                          >
                            {genre.trim()}
                          </span>
                        ))
                      : ''}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.runtimeMinutes}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.averageRating}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    <TextField
                      size="small"
                      type="number"
                      value={
                        editRating[rating.movie_id] !== undefined
                          ? editRating[rating.movie_id]
                          : rating.rating
                      }
                      onChange={e => handleEditRating(rating.movie_id, e.target.value)}
                      inputProps={{ min: 0, max: 10, step: 0.1, style: { color: '#fff', fontFamily: "'Archivo', Arial, sans-serif" } }}
                      InputProps={{ style: { color: '#fff', fontFamily: "'Archivo', Arial, sans-serif" } }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.writers ? (
                      <Tooltip
                        title={
                          <span>
                            {rating.writers.split(',').map((writer, idx) => (
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
                          {rating.writers
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
                          {rating.writers.split(',').length > 2 && (
                            <span style={{ color: '#bbb', marginLeft: 4 }}>
                              +{rating.writers.split(',').length - 2} more
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif", borderRight: '2px solid rgba(255,255,255,0.18)' }}>
                    {rating.directors ? (
                      <Tooltip
                        title={
                          <span>
                            {rating.directors.split(',').map((director, idx) => (
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
                          {rating.directors
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
                          {rating.directors.split(',').length > 2 && (
                            <span style={{ color: '#bbb', marginLeft: 4 }}>
                              +{rating.directors.split(',').length - 2} more
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontFamily: "'Archivo', Arial, sans-serif" }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Button
                        color="inherit"
                        variant="contained"
                        sx={{
                          background: 'rgba(30,30,40,0.85)',
                          color: '#fff',
                          fontWeight: 700,
                          border: '1.5px solid rgba(144,202,249,0.25)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
                          textTransform: 'none',
                          fontFamily: "'Archivo', Arial, sans-serif",
                          width: 90,
                          '&:hover': {
                            background: 'rgba(30,40,60,0.95)',
                            border: '1.5px solid #90caf9',
                            color: '#fff',
                          }
                        }}
                        onClick={() => handleSaveRating(rating.movie_id)}
                        disabled={editRating[rating.movie_id] === undefined}
                      >
                        Modify
                      </Button>
                      <Button
                        color="error"
                        variant="contained"
                        sx={{
                          fontFamily: "'Archivo', Arial, sans-serif",
                          width: 90,
                          fontWeight: 700,
                          background: 'rgba(200,40,40,0.85)',
                          color: '#fff',
                          border: '1.5px solid rgba(255,80,80,0.25)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(200,40,40,0.10)',
                          textTransform: 'none',
                          '&:hover': {
                            background: 'rgba(255,80,80,0.95)',
                            border: '1.5px solid #ff5252',
                            color: '#fff',
                          }
                        }}
                        onClick={() => handleDeleteRating(rating.movie_id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <style>
      {`
        @keyframes usernameGradient {
          0% { color: #ffffff; }
          50% { color: #90caf9; }
          100% { color: #ffffff; }
        }
        .animated-username {
          animation: usernameGradient 3s ease-in-out infinite;
          font-style: normal;
        }
      `}
      </style>
    </Layout>
  );
}

export default Account;