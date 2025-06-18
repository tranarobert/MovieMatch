import { Typography, Box, Grid, Card, CardContent, IconButton } from '@mui/material';
import Layout from './Layout';
import MovieIcon from '@mui/icons-material/Movie';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RecommendIcon from '@mui/icons-material/Recommend';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const containerStyle = {
    background: 'linear-gradient(135deg, rgba(30,40,60,0.95) 0%, rgba(40,50,70,0.95) 100%)',
    borderRadius: 4,
    height: 200,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    border: '1px solid rgba(144, 202, 249, 0.2)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      transform: 'translateY(-10px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(144, 202, 249, 0.3)',
      border: '1px solid rgba(144, 202, 249, 0.5)',
      '& .arrow-icon': {
        opacity: 1,
        transform: 'translateX(0) rotate(0deg)',
      },
      '& .feature-icon': {
        transform: 'scale(1.15) rotate(5deg)',
      },
      '& .gradient-bar': {
        opacity: 1,
        transform: 'scaleX(1)',
      },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #90caf9, #81c784, #ffd700, #ff8a65, #ba68c8)',
      opacity: 0,
      transition: 'all 0.3s ease',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
    },
    '&:hover::before': {
      opacity: 1,
      transform: 'scaleX(1)',
    },
  };

  const features = [
    {
      icon: <AccountCircleIcon sx={{ fontSize: 48, color: '#fff' }} />,
      title: 'Personal Profile',
      description: 'Track your movie journey with personalized ratings, preferences, and viewing history. Build your unique taste profile.',
      route: '/account',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentColor: '#667eea',
    },
    {
      icon: <RecommendIcon sx={{ fontSize: 48, color: '#fff' }} />,
      title: 'AI Recommendations',
      description: 'Discover your next favorite with advanced machine learning algorithms that understand your unique preferences.',
      route: '/recommendations',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      accentColor: '#4facfe',
    },
    {
      icon: <SearchIcon sx={{ fontSize: 48, color: '#fff' }} />,
      title: 'Smart Search',
      description: 'Find content instantly by title, genre, director, writer, year, or any combination with intelligent filtering.',
      route: '/search',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      accentColor: '#43e97b',
    },
    {
      icon: <ThumbUpIcon sx={{ fontSize: 48, color: '#fff' }} />,
      title: 'Trending Now',
      description: 'Explore the most popular and highest-rated movies and TV shows that everyone is talking about.',
      route: '/top-titles',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      accentColor: '#fa709a',
    },
  ];

  return (
    <Layout>
      <Box sx={{ textAlign: 'center', mt: 4, mb: 6 }}>
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: 800,
            fontFamily: "'Archivo', Arial, sans-serif",
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          Welcome to MovieMatch
        </Typography>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: '#90caf9',
            fontWeight: 500,
            mb: 3,
            opacity: 0.9,
          }}
        >
          Your AI-powered cinematic discovery platform
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 800,
            mx: 'auto',
            mb: 4,
            color: '#ccc',
            fontSize: '1.2rem',
            lineHeight: 1.7,
            fontWeight: 300,
          }}
        >
          Discover your next favorite movie or TV show with advanced machine learning.
          Rate content, get personalized recommendations, and explore the world of entertainment like never before.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', px: 2.5, mx: 'auto' }}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {features.map((feature, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  ...containerStyle,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => navigate(feature.route)}
              >
                <CardContent
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 4,
                    position: 'relative',
                    flex: 1,
                    minHeight: 200,
                  }}
                >
                  {/* Feature Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 2,
                      position: 'relative',
                    }}
                  >
                    <Box
                      className="feature-icon"
                      sx={{
                        background: feature.gradient,
                        borderRadius: '16px',
                        p: 2,
                        mr: 3,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 32px ${feature.accentColor}40`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.3rem',
                          color: '#fff',
                          lineHeight: 1.2,
                          mb: 1,
                        }}
                      >
                        {feature.title}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    sx={{
                      color: '#ccc',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      flexGrow: 1,
                      mb: 2,
                      fontWeight: 300,
                      minHeight: 60,
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    {feature.description}
                  </Typography>

                  {/* Arrow Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      minHeight: 40,
                    }}
                  >
                    <IconButton
                      className="arrow-icon"
                      sx={{
                        color: feature.accentColor,
                        opacity: 0,
                        transform: 'translateX(-15px) rotate(-90deg)',
                        transition: 'all 0.4s ease',
                        background: `${feature.accentColor}20`,
                        '&:hover': {
                          backgroundColor: `${feature.accentColor}30`,
                          transform: 'translateX(0) rotate(0deg) scale(1.1)',
                        },
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>

                  {/* Number Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#fff',
                      boxShadow: `0 4px 16px ${feature.accentColor}60`,
                    }}
                  >
                    {index + 1}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
}

export default Home;