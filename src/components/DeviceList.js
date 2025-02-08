import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    description: '',
    status: ''
  });
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/devices');
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Erreur lors de la récupération des appareils:', error);
      setAlertInfo({
        show: true,
        message: "Erreur lors de la récupération des appareils",
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);
   
  const handleAddDevice = async () => {
    try {
      await axios.post('http://localhost:5000/devices', newDevice);
      await fetchDevices();
      setOpen(false);
      setAlertInfo({
        show: true,
        message: 'Appareil ajouté avec succès!',
        severity: 'success'
      });
      setNewDevice({ name: '', description: '', status: '' });
    } catch (error) {
      setAlertInfo({
        show: true,
        message: "Erreur lors de l'ajout de l'appareil",
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (device) => {
    setSelectedDevice(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/devices/${selectedDevice.id}`);
      await fetchDevices();
      setDeleteDialogOpen(false);
      setAlertInfo({
        show: true,
        message: 'Appareil supprimé avec succès!',
        severity: 'success'
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        message: "Erreur lors de la suppression de l'appareil",
        severity: 'error'
      });
    }
  };

  const handleEditClick = (device) => {
    setSelectedDevice(device);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    try {
      await axios.put(`http://localhost:5000/devices/${selectedDevice.id}`, selectedDevice);
      await fetchDevices();
      setEditDialogOpen(false);
      setAlertInfo({
        show: true,
        message: 'Appareil modifié avec succès!',
        severity: 'success'
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        message: "Erreur lors de la modification de l'appareil",
        severity: 'error'
      });
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/devices/search`, {
        params: { q: searchQuery }
      });
      if (response.data && Array.isArray(response.data.devices)) {
        setDevices(response.data.devices);
      }
    } catch (error) {
      setAlertInfo({
        show: true,
        message: "Erreur lors de la recherche",
        severity: 'error'
      });
      console.error("Erreur lors de la recherche:", error);
    }
};

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {alertInfo.show && (
        <Alert 
          severity={alertInfo.severity}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          sx={{ mb: 2 }}
        >
          {alertInfo.message}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
            Liste des Appareils
          </Typography>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexGrow: 1,
            maxWidth: '600px'
          }}>
            <TextField
              size="small"
              placeholder="Rechercher un appareil..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Rechercher
            </Button>
            <Button 
              variant="contained" 
              onClick={() => setOpen(true)}
              startIcon={<AddIcon />}
            >
              Ajouter
            </Button>
            <Button 
              variant="contained"
              color="secondary"
              onClick={() => navigate('/monitoring')}
            >
              Voir Monitoring
            </Button>
          </div>
        </div>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: '#1976d2', 
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                Nom
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderLeft: '1px solid #ddd'
                }}
              >
                Description
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderLeft: '1px solid #ddd'
                }}
              >
                Status
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderLeft: '1px solid #ddd'
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow 
                key={device.id}
                sx={{ '&:hover': { backgroundColor: '#f8f8f8' } }}
              >
                <TableCell 
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {device.name}
                </TableCell>
                <TableCell 
                  sx={{ 
                    textAlign: 'center',
                    borderLeft: '1px solid #ddd'
                  }}
                >
                  {device.description}
                </TableCell>
                <TableCell 
                  sx={{ 
                    textAlign: 'center',
                    borderLeft: '1px solid #ddd'
                  }}
                >
                  {device.status}
                </TableCell>
                <TableCell 
                  sx={{ 
                    textAlign: 'center',
                    borderLeft: '1px solid #ddd'
                  }}
                >
                  <Button 
                    color="primary" 
                    onClick={() => handleEditClick(device)}
                    sx={{ mr: 1 }}
                    variant="contained"
                    size="small"
                  >
                    Modifier
                  </Button>
                  <Button 
                    color="error"
                    onClick={() => handleDeleteClick(device)}
                    variant="contained"
                    size="small"
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog pour ajouter un nouvel appareil */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Ajouter un nouvel appareil</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom"
            margin="normal"
            value={newDevice.name}
            onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={newDevice.description}
            onChange={(e) => setNewDevice({...newDevice, description: e.target.value})}
          />
          <TextField
            fullWidth
            select
            label="Status"
            margin="normal"
            value={newDevice.status}
            onChange={(e) => setNewDevice({...newDevice, status: e.target.value})}
            SelectProps={{ native: true }}
          >
            <option value="">-- Sélectionnez --</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleAddDevice} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'appareil <strong>{selectedDevice?.name}</strong> ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Modifier l'appareil</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom"
            margin="normal"
            value={selectedDevice?.name || ''}
            onChange={(e) => setSelectedDevice({...selectedDevice, name: e.target.value})}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={selectedDevice?.description || ''}
            onChange={(e) => setSelectedDevice({...selectedDevice, description: e.target.value})}
          />
          <TextField
            fullWidth
            select
            label="Status"
            margin="normal"
            value={selectedDevice?.status || ''}
            onChange={(e) => setSelectedDevice({...selectedDevice, status: e.target.value})}
            SelectProps={{ native: true }}
          >
            <option value="">-- Sélectionnez --</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleEditConfirm} color="primary" variant="contained">
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DeviceList; 