import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import IDE from './pages/IDE';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/editor/:roomId" 
        element={
          <ProtectedRoute>
            <IDE />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;