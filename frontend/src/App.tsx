import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { LoginChoice } from './pages/LoginChoice';
import { Login } from './pages/Login';
import { PatientDashboard } from './pages/PatientDashboard';
import { ExercisePage } from './pages/ExercisePage';
import { PatientHistory } from './pages/PatientHistory';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDetail } from './pages/PatientDetail';
import { UserProfile } from './pages/UserProfile';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user?.role === 'doctor' ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login-choice" element={user ? <Navigate to="/" replace /> : <LoginChoice />} />
      <Route path="/login/:role" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      {/* Dashboard Route - redirects based on role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/exercise"
        element={
          <ProtectedRoute requiredRole="patient">
            <ExercisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute requiredRole="patient">
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/patient/:patientId"
        element={
          <ProtectedRoute requiredRole="doctor">
            <PatientDetail />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
