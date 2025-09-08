// src/components/EmployeeSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Calendar, FileText, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/authContext";

const EmployeeSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: "/employee-dashboard/profile", label: "Profile", icon: User },
    { path: "/employee-dashboard/leave", label: "Leave Management", icon: Calendar },
    { path: "/employee-dashboard/leave-history", label: "Leave History", icon: FileText }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Toggle button (mobile / topbar) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-teal-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Employee Panel</h2>
          {user && (
            <p className="text-sm text-gray-600 mt-1">Welcome, {user.name}</p>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={toggleSidebar} // close sidebar after navigation (mobile)
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                        : "text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;