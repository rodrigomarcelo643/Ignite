import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import PublicNavbar from './components/PublicNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import BarangayLayout from './pages/barangay/BarangayLayout';
import Services from './pages/Services';
import './App.css';
import Pricing from './pages/public/Pricing';

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<><PublicNavbar /><Home /></>} />
          <Route path="/about" element={<><PublicNavbar /><About /></>} />
          <Route path="/register" element={<><PublicNavbar /><Register /></>} />
          <Route path="services" element={<><PublicNavbar /><Services /></>} />
          <Route path="/pricing" element={<><PublicNavbar /><Pricing /></>} />
          <Route 
            path="/barangay/*" 
            element={
              <ProtectedRoute requiredRole="barangay">
                <BarangayLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/*" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <div>Citizen Dashboard</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App
