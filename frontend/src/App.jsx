import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./layouts/Login";
import Register from "./layouts/Register";

// Admin
import AdminDashboard from "./layouts/AdminDashboard";
import EmployeePage from "./pages/Admin/EmployeePage";
import SalaryPage from "./pages/Admin/SalaryPage";
import LeavePage from "./pages/Admin/LeavePage";
import DepartmentPage from "./pages/Admin/DepartmentPage";
import SettingsPage from "./pages/Admin/SettingsPage";
import DashboardHome from "./pages/Admin/DashboardHome";
import PaySalaryPage from "./pages/Admin/PaySalaryPage"
// Employee
import EmployeeDashboard from "./layouts/EmployeeDashboard";
// import ProfilePage from "./pages/Employee/EmployeeProfile";
import ApplyLeave from "./pages/Employee/ApplyLeave";
import LeaveHistory from "./pages/Employee/LeaveHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeProfile from "./pages/Employee/EmployeeProfile";

function App() {
  return (
    // <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="employee" element={<EmployeePage />} />
          <Route path="salary" element={<SalaryPage />} />
          <Route path="leaves" element={<LeavePage />} />
          <Route path="department" element={<DepartmentPage />} />
                    <Route path="pay" element={<PaySalaryPage />} />

          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Employee routes */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" />} />
          <Route path="profile" element={<EmployeeProfile />} />
 <Route path="leave" element={<ApplyLeave />} />
            <Route path="leave-history" element={<LeaveHistory />} />        </Route>
      </Routes>
    // {/* </BrowserRouter> */}
  );
}

export default App;
