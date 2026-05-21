import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import NewIncidentPage from './pages/NewIncidentPage';
import InventoryPage   from './pages/InventoryPage';
import StatsPage       from './pages/StatsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/nueva-incidencia" element={<NewIncidentPage />} />
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/dashboard"  element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
          <Route path="/stats"      element={<PrivateRoute><StatsPage /></PrivateRoute>} />
          <Route path="/"           element={<Navigate to="/nueva-incidencia" replace />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
