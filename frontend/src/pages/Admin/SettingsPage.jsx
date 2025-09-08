import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("password");
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Profile settings state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: ""
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    systemAlerts: true
  });
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || ""
      });
    }
  }, [user]);

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from old password");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");
      
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Password change error:", error);
      if (error.response?.data?.error) {
        setPasswordError(error.response.data.error);
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Profile update handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.name || !profileData.email) {
      setProfileError("Name and email are required");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setProfileSuccess("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      if (error.response?.data?.error) {
        setProfileError(error.response.data.error);
      } else {
        setProfileError("Failed to update profile. Please try again.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Notification handlers
  const handleNotificationChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    setNotificationLoading(true);
    
    // Simulate API call for notifications
    setTimeout(() => {
      setNotificationLoading(false);
    }, 500);
  };

  const tabs = [
    { id: "password", label: "Change Password", icon: "🔒" },
    { id: "profile", label: "Profile Settings", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🛡️" }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-lg">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600 bg-teal-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Password Change Tab */}
          {activeTab === "password" && (
            <div className="max-w-md space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
                <p className="text-gray-600 mb-6">Update your password to keep your account secure</p>
              </div>

              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    passwordLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  } text-white`}
                >
                  {passwordLoading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>
                <p className="text-gray-600 mb-6">Update your personal information</p>
              </div>

              {profileError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Department can only be changed by admin</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className={`py-2 px-6 rounded-lg font-medium transition-colors ${
                      profileLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-teal-600 hover:bg-teal-700"
                    } text-white`}
                  >
                    {profileLoading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
                <p className="text-gray-600 mb-6">Manage how you receive notifications</p>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {key === 'emailNotifications' && 'Email Notifications'}
                        {key === 'pushNotifications' && 'Push Notifications'}
                        {key === 'weeklyReports' && 'Weekly Reports'}
                        {key === 'systemAlerts' && 'System Alerts'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'pushNotifications' && 'Receive push notifications in browser'}
                        {key === 'weeklyReports' && 'Get weekly summary reports'}
                        {key === 'systemAlerts' && 'Important system announcements'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={value}
                        onChange={() => handleNotificationChange(key)}
                        disabled={notificationLoading}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
                <p className="text-gray-600 mb-6">Manage your account security</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Account ID:</span> {user?._id || 'N/A'}</p>
                    <p><span className="text-gray-600">Role:</span> {user?.role || 'N/A'}</p>
                    <p><span className="text-gray-600">Last Login:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Account Status:</span> 
                      <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Security Recommendations</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Change your password regularly</li>
                    <li>• Use a strong password with mixed characters</li>
                    <li>• Don't share your login credentials</li>
                    <li>• Log out from shared computers</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab("password")}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                  >
                    Change Password
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    Logout All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;