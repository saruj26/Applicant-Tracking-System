import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applicants from './pages/Applicants';
import Careers from './pages/public/Careers';
import JobDetail from './pages/public/JobDetail';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
           <Routes>
            {/* Public routes with PublicLayout */}
            <Route element={<PublicLayout><Home /></PublicLayout>} path="/" />
            <Route element={<PublicLayout><Careers /></PublicLayout>} path="/careers" />
            <Route element={<PublicLayout><JobDetail /></PublicLayout>} path="/careers/:id" />
            <Route element={<PublicLayout><Login /></PublicLayout>} path="/login" />
            <Route element={<PublicLayout><Register /></PublicLayout>} path="/register" />
            
            {/* Protected routes with Layout (Sidebar) */}
            <Route element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/applicants" element={<Applicants />} />
              <Route path="/reports" element={<div>Reports Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
              <Route path="/profile" element={<div>Profile Page</div>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;