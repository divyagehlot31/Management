import React from "react";
import { useAuth } from "../context/authContext";
import { NotificationBell } from "./NotificationPanel";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const { logout, user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {user?.role === "admin" ? "Admin Dashboard" : "Employee Dashboard"}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;