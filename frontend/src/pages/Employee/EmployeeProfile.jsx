// src/pages/employee/EmployeeProfile.jsx
import React, { useState, useEffect } from "react";
// import axios from "axios";
import API from "../../utils/api";
import { useAuth } from "../../context/authContext";
import { User, Mail, Phone, Calendar, Building, Key, Edit, Save, X, RefreshCw } from "lucide-react";

const EmployeeProfile = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // ✅ FIXED: Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found");
        return;
      }

            const res = await API.get("/auth/profile", {

      // const res = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // Update the auth context with fresh user data
        login(token, res.data.user);
        setSuccess("Profile data refreshed!");
        
        // Update local profile data state
        setProfileData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
        });
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setError(err.response?.data?.error || "Failed to refresh profile data");
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ NEW: Auto-refresh on component mount to get latest department info
  useEffect(() => {
    refreshUserData();
  }, []); // Run once on mount

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
            const res = await API.put("/auth/update-profile",

      // const res = await axios.put("http://localhost:5000/api/auth/update-profile",
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        // ✅ FIXED: Use the updated user data from server response
        login(token, res.data.user);
        setSuccess("Profile updated successfully!");
        setEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
            const res = await API.put("/auth/change-password",

      // const res = await axios.put("http://localhost:5000/api/auth/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setSuccess("Password changed successfully!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setChangingPassword(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <User className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Profile</h2>
        </div>
        
        {/* ✅ FIXED: Refresh button */}
        <button
          onClick={refreshUserData}
          disabled={refreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition ${
            refreshing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Information Card */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            <button
              onClick={() => {
                setEditing(!editing);
                setError(null);
                setSuccess(null);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg"
            >
              {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              <span>{editing ? "Cancel" : "Edit"}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-white font-medium ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Full Name</p>
                  <p className="text-gray-900">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{user?.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">
                    {/* ✅ FIXED: Better department display logic */}
                    {user?.department?.name || "Not assigned"}
                  </p>
                  {user?.department?.description && (
                    <p className="text-sm text-gray-500 mt-1">{user.department.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Join Date</p>
                  <p className="text-gray-900">{formatDate(user?.joinDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                  <p className="text-gray-900">{formatDate(user?.dateOfBirth)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Card */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Employee Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Employee ID</p>
              <p className="text-gray-900 font-mono">{user?.employeeId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Role</p>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.isActive !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user?.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {/* ✅ NEW: Show additional employee details if available */}
          {(user?.address || user?.salary) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              {user?.address && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-gray-900">{user.address}</p>
                </div>
              )}
              {user?.salary && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Salary</p>
                  <p className="text-gray-900">₹{user.salary.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Security</h3>
            <button
              onClick={() => {
                setChangingPassword(!changingPassword);
                setError(null);
                setSuccess(null);
                setPasswordData({
                  oldPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg"
            >
              <Key className="h-4 w-4" />
              <span>{changingPassword ? "Cancel" : "Change Password"}</span>
            </button>
          </div>
        </div>

        {changingPassword && (
          <div className="p-6">
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-white font-medium ${
                    passwordLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>{passwordLoading ? "Changing..." : "Change Password"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;