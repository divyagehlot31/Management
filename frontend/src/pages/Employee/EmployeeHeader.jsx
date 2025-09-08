// src/components/EmployeeHeader.jsx
import React from "react";
// import { Bell, Settings } from "lucide-react";
import { useAuth } from "../../context/authContext";
const EmployeeHeader = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            {user?.employeeId && `Employee ID: ${user.employeeId}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {/* <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
          </button> */}
          
          {/* Settings */}
          {/* <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <Settings size={20} />
          </button> */}
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;