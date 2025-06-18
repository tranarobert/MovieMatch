import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';

function Layout({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Top Titles', to: '/top-titles' },
    { label: 'Recommendations', to: '/recommendations' },
    { label: 'Search', to: '/search' },
  ];

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await axios.get(`${apiUrl}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };
    fetchUsername();
  }, [apiUrl]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUsernameClick = () => {
    navigate('/account');
  };

  return (
    <>
      {/* Static gradient background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            linear-gradient(135deg, 
              #0c1929 0%, 
              #1a2332 25%, 
              #2a3441 50%, 
              #1e2a3a 75%, 
              #0f1419 100%
            )
          `,
          zIndex: -1,
        }}
      />
      
      {/* CSS animation for username gradient */}
      <style>
        {`
          @keyframes usernameGradient {
            0% { color: #ffffff; }
            50% { color: #90caf9; }
            100% { color: #ffffff; }
          }
          .animated-username {
            animation: usernameGradient 3s ease-in-out infinite;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .animated-username:hover {
            transform: scale(1.05);
          }
        `}
      </style>
      
      <Box sx={{ m: 2 }}>
        <AppBar
          position="static"
          sx={{
            background: 'rgba(30,30,40,0.85)',
            boxShadow: '0 4px 32px 0 rgba(31,38,135,0.17)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              MovieMatch
            </Typography>
            {/* Desktop Nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, justifyContent: 'center', flexGrow: 2 }}>
              {navLinks.map(link => (
                <Button key={link.label} color="inherit" component={Link} to={link.to}>
                  {link.label === 'Search' ? <SearchIcon /> : link.label}
                </Button>
              ))}
            </Box>
            {/* Burger Icon for Mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            </Box>
            {/* User/Logout */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
              <Typography
                variant="body1"
                sx={{ 
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Hello,{' '}
                <span 
                  className="animated-username"
                  onClick={handleUsernameClick}
                  style={{ fontWeight: 700 }}
                >
                  {username || 'User'}
                </span>
              </Typography>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Box>
          </Toolbar>
        </AppBar>
        {/* Drawer for Mobile */}
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <List sx={{ width: 220, bgcolor: 'rgba(30,30,40,0.97)', height: '100%' }}>
            {navLinks.map(link => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ color: '#fff' }} // Force button text white
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ sx: { color: '#fff', fontWeight: 600 } }} // Force text white and bold
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
      <Box sx={{ m: 2 }}>{children}</Box>
    </>
  );
}

export default Layout;