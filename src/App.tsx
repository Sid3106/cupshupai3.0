import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import VendorLayout from './layouts/VendorLayout';
import ClientLayout from './layouts/ClientLayout';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CupShupDashboard from './pages/dashboard/CupShupDashboard';
import VendorList from './pages/vendors/VendorList';
import ClientList from './pages/clients/ClientList';
import ActivityList from './pages/activities/ActivityList';
import ActivityDetail from './pages/activities/ActivityDetail';
import MappedActivities from './pages/activities/MappedActivities';
import MappedTasks from './pages/tasks/MappedTasks';
import InviteUser from './pages/invite/InviteUser';
import ActivityForm from './pages/activities/ActivityForm';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorActivityList from './pages/vendor/Activities';
import MyActivities from './pages/vendor/MyActivities';
import MyTasks from './pages/vendor/MyTasks';
import AuthCallback from './pages/auth/AuthCallback';
import RoleBasedRoute from './components/RoleBasedRoute';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AddTask from './pages/vendor/AddTask';
import VendorActivityDetail from './pages/vendor/VendorActivityDetail';
import ClientDashboard from './pages/client/dashboard';
import ClientProfile from './pages/client/profile';
import BrandTasks from './pages/client/BrandTasks';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Router>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Route>

            {/* Role-based redirect */}
            <Route path="/" element={<RoleBasedRoute />} />

            {/* Common routes for authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* CupShup routes */}
            <Route element={<ProtectedRoute allowedRoles={['CupShup']} />}>
              <Route path="/cupshup" element={<DashboardLayout />}>
                <Route index element={<CupShupDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="vendors" element={<VendorList />} />
                <Route path="clients" element={<ClientList />} />
                <Route path="activities" element={<ActivityList />} />
                <Route path="activities/:id" element={<ActivityDetail />} />
                <Route path="mapped-activities" element={<MappedActivities />} />
                <Route path="mapped-tasks" element={<MappedTasks />} />
                <Route path="invite/vendor" element={<InviteUser type="vendor" />} />
                <Route path="invite/client" element={<InviteUser type="client" />} />
                <Route path="activities/new" element={<ActivityForm />} />
              </Route>
            </Route>

            {/* Vendor routes */}
            <Route element={<ProtectedRoute allowedRoles={['Vendor']} />}>
              <Route path="/vendor" element={<VendorLayout />}>
                <Route index element={<VendorDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="activities" element={<VendorActivityList />} />
                <Route path="my-activities" element={<MyActivities />} />
                <Route path="my-tasks" element={<MyTasks />} />
                <Route path="activities/:id" element={<VendorActivityDetail />} />
                <Route path="activities/:id/tasks/new" element={<AddTask />} />
              </Route>
            </Route>

            {/* Client routes */}
            <Route element={<ProtectedRoute allowedRoles={['Client']} />}>
              <Route path="/client" element={<ClientLayout />}>
                <Route index element={<ClientDashboard />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="profile" element={<ClientProfile />} />
                <Route path="tasks" element={<BrandTasks />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;