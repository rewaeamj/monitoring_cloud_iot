import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DeviceList from './components/DeviceList';
import DeviceMonitoring from './components/DeviceMonitoring';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/devices" element={<DeviceList />} />
        <Route path="/monitoring" element={<DeviceMonitoring />} />
        <Route path="/" element={<Navigate to="/devices" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 