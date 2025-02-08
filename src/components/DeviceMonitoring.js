import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import axios from 'axios';
import { CONFIG } from '../config';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DeviceMonitoring() {
  const [realTimeData, setRealTimeData] = useState([]);
  const [stats, setStats] = useState({
    total_devices: 0,
    total_events: 0,
    active_devices: 0
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Activité des appareils',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  });
  const [selectedDevice, setSelectedDevice] = useState('device1');

  useEffect(() => {
    // Connexion Socket.IO
    const socket = io(CONFIG.SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
    });
    
    socket.on('device_update', (data) => {
      console.log('Nouvelle donnée reçue:', {
        device: data.device_id,
        type: data.type,
        value: data.value,
        status: data.status
      });
      setRealTimeData(prev => [...prev, data].slice(-10));
      updateChart(data);
    });

    // Charger les statistiques initiales
    fetchStats();
    // Charger l'historique initial
    fetchHistory();

    // Nettoyer la connexion socket à la destruction du composant
    return () => socket.disconnect();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${CONFIG.MONITORING_API_URL}/monitoring/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const fetchHistory = async (deviceId) => {
    try {
      const response = await axios.get(`${CONFIG.MONITORING_API_URL}/monitoring/history/${deviceId}`);
      if (response.data && response.data.history) {
        setRealTimeData(response.data.history.slice(-10));
        const lastTenEvents = response.data.history.slice(-10);
        setChartData({
          labels: lastTenEvents.map(event => new Date(event.timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Activité des appareils',
            data: lastTenEvents.map(event => event.value),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    }
  };

  const updateChart = (newData) => {
    setChartData(prev => ({
      labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-10),
      datasets: [{
        ...prev.datasets[0],
        data: [...prev.datasets[0].data, newData.value].slice(-10)
      }]
    }));
  };

  const handleDeviceChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    fetchHistory(deviceId);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Monitoring des Appareils
      </Typography>

      <Grid container spacing={3}>
        {/* Cartes de statistiques */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Appareils Totaux</Typography>
              <Typography variant="h4">{stats.total_devices}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Nombre total d'appareils enregistrés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: stats.active_devices > 0 ? 'success.light' : 'warning.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Appareils Actifs</Typography>
              <Typography variant="h4">{stats.active_devices}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {((stats.active_devices / stats.total_devices) * 100).toFixed(1)}% des appareils sont actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Événements Totaux</Typography>
              <Typography variant="h4">{stats.total_events}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Moyenne de {(stats.total_events / stats.total_devices).toFixed(1)} événements par appareil
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité en Temps Réel
            </Typography>
            <Line data={chartData} options={{ 
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </Paper>
        </Grid>

        {/* Tableau des derniers événements */}
        <Grid item xs={12}>
          <FormControl sx={{ mb: 2, minWidth: 200 }}>
            <InputLabel>Sélectionner un appareil</InputLabel>
            <Select
              value={selectedDevice}
              onChange={handleDeviceChange}
              label="Sélectionner un appareil"
            >
              <MenuItem value="device1">Appareil 1</MenuItem>
              <MenuItem value="device2">Appareil 2</MenuItem>
              <MenuItem value="device3">Appareil 3</MenuItem>
            </Select>
          </FormControl>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Appareil</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Valeur</TableCell>
                  <TableCell>Horodatage</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {realTimeData.map((event, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      bgcolor: event.status === 'active' ? 'success.light' : 'warning.light',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    <TableCell>{event.device_id}</TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell>{event.value.toFixed(2)}</TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: event.status === 'active' ? 'success.dark' : 'warning.dark',
                          fontWeight: 'bold'
                        }}
                      >
                        {event.status.toUpperCase()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DeviceMonitoring; 