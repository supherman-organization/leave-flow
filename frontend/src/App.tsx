import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleRoute from './components/routing/RoleRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import NewRequest from './pages/NewRequest';
import ManageRequests from './pages/ManageRequests';
import GlobalCalendar from './pages/GlobalCalendar';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Authentifié mais sans layout (1re connexion) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/set-password" element={<SetPassword />} />
      </Route>

      {/* Authentifié + layout complet */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/new-request" element={<NewRequest />} />
          <Route path="/global-calendar" element={<GlobalCalendar />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<RoleRoute allow={['manager', 'hr']} />}>
            <Route path="/manage-requests" element={<ManageRequests />} />
          </Route>
          <Route element={<RoleRoute allow={['hr']} />}>
            <Route path="/user-management" element={<UserManagement />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}