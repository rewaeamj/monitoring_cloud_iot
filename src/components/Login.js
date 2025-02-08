import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box 
} from '@mui/material';
import axios from 'axios';

function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', credentials);
      console.log('Réponse du serveur:', response.data);

      if (response.data.message === 'Connexion reussie') {
        // Pour le moment, on utilise un token temporaire
        localStorage.setItem('token', 'temp_token');
        console.log('Token stocké');
        
        // Redirection vers /devices
        navigate('/devices', { replace: true });
      } else {
        console.log('Échec de la connexion');
        setError('Erreur de connexion. Vérifiez vos identifiants.');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.error || 'Erreur de connexion. Vérifiez vos identifiants.');
    }
  };

  // Fonction pour gérer la soumission avec le bouton
  const handleButtonClick = () => {
    handleSubmit(new Event('submit'));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Connexion
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email d'utilisateur"
            margin="normal"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            onClick={handleButtonClick}
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Se connecter
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login; 