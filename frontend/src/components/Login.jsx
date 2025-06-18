import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, FormControlLabel, Switch, Alert, Paper } from '@mui/material';
import { AuthContext } from '../context/AuthContext.jsx';

function Login() {
  const { login, register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(username, email, password);
        setIsRegister(false);
      } else {
        const success = await login(username, password);
        if (success) {
          navigate('/recommendations');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 40px)', // account for navbar margin
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        m: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          minWidth: 320,
          maxWidth: 400,
          width: '100%',
          background: 'rgba(30,30,40,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 700 }}>
          {isRegister ? 'Register' : 'Login'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label="Username"
            variant="outlined"
            margin="normal"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{ style: { color: '#fff' } }}
            InputLabelProps={{ style: { color: '#fff' } }}
          />
          {isRegister && (
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
          )}
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{ style: { color: '#fff' } }}
            InputLabelProps={{ style: { color: '#fff' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              mb: 2,
              fontWeight: 700,
              fontFamily: "'Archivo', Arial, sans-serif",
              background: 'rgba(30,30,40,0.85)',
              color: '#fff',
              border: '1.5px solid rgba(144,202,249,0.25)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
              textTransform: 'none',
              fontSize: 18,
              letterSpacing: 1,
              '&:hover': {
                background: 'rgba(30,40,60,0.95)',
                border: '1.5px solid #90caf9',
                color: '#fff',
              }
            }}
          >
            {isRegister ? 'Register' : 'Login'}
          </Button>
          <FormControlLabel
            control={<Switch checked={isRegister} onChange={() => setIsRegister(!isRegister)} />}
            label={isRegister ? 'Switch to Login' : 'Switch to Register'}
            sx={{ color: '#fff', width: '100%', justifyContent: 'center' }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;